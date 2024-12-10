const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const Company = require('../../models/Company');
const Job = require('../../models/Job');
const logger = require('../../utils/logger');
const connectDB = require('../../config/database');

class SaraminCrawler {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    this.baseUrl = 'https://www.saramin.co.kr/zf_user/search/recruit';
    this.retryLimit = 3;
    this.retryDelay = 2000;
    this.pageDelay = 1000;
    this.requestDelay = 500;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchWithRetry(url, retryCount = 0) {
    try {
      await this.delay(this.requestDelay);
      const response = await axios.get(url, { 
        headers: this.headers,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (retryCount < this.retryLimit) {
        logger.warn(`Retry attempt ${retryCount + 1} for URL: ${url}`);
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.fetchWithRetry(url, retryCount + 1);
      }
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      logger.info('Initializing database...');
      await Job.deleteMany({});
      await Company.deleteMany({});
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Error initializing database:', error);
      throw error;
    }
  }

  async saveCompany(companyData) {
    try {
      const company = await Company.findOneAndUpdate(
        { companyName: companyData.companyName },
        {
          $set: {
            ...companyData,
            updatedAt: new Date()
          }
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true 
        }
      );
      return company;
    } catch (error) {
      logger.error('Error saving company:', error);
      throw error;
    }
  }

  async saveJob(jobData, companyId) {
    try {
      const job = await Job.findOneAndUpdate(
        { originalPostingUrl: jobData.originalPostingUrl },
        {
          $set: {
            ...jobData,
            companyId,
            updatedAt: new Date()
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
      return job;
    } catch (error) {
      logger.error('Error saving job:', error);
      throw error;
    }
  }

  async parseAndSaveJobListing($, job) {
    try {
      const jobDetailUrl = 'https://www.saramin.co.kr' + $(job).find('.job_tit a').attr('href');
      const detailHtml = await this.fetchWithRetry(jobDetailUrl);
      const $detail = cheerio.load(detailHtml);

      const requirements = [];
      $detail('.recruitment-detail__type').each((_, item) => {
        const label = $(item).find('.recruitment-detail__label').text().trim();
        const data = $(item).find('.recruitment-detail__text').text().trim();
        if (label && data) {
          requirements.push(`${label}: ${data}`);
        }
      });

      const skills = [];
      $detail('.job_workplace').find('span.highlight').each((_, item) => {
        const skill = $(item).text().trim();
        if (skill) skills.push(skill);
      });

      const companyData = {
        companyName: $(job).find('.corp_name a').text().trim(),
        industry: $(job).find('.job_sector').text().trim() || '미분류',
        location: {
          address: $(job).find('.job_condition span').eq(0).text().trim(),
          city: $(job).find('.job_condition span').eq(0).text().trim().split(' ')[0],
          country: 'KR'
        }
      };

      const company = await this.saveCompany(companyData);

      const jobData = {
        title: $(job).find('.job_tit a').text().trim(),
        description: $detail('.recruitment-detail__text').text().trim() || 
                    $detail('.wrap_job_content').text().trim() ||
                    "상세 내용 없음",
        location: companyData.location,
        experienceLevel: this.parseExperienceLevel($(job).find('.job_condition span').eq(1).text().trim()),
        jobType: this.parseJobType($(job).find('.job_condition span').eq(3).text().trim()),
        salary: this.parseSalaryInfo($detail('.salary').text().trim()),
        deadline: this.parseDeadline($(job).find('.job_date .date').text().trim()),
        requirements,
        skills,
        originalPostingUrl: jobDetailUrl,
        status: 'ACTIVE'
      };

      const savedJob = await this.saveJob(jobData, company._id);
      return savedJob;
    } catch (error) {
      logger.error('Error parsing and saving job listing:', error);
      return null;
    }
  }

  parseExperienceLevel(experience) {
    if (experience.includes('신입')) return 'ENTRY';
    if (experience.includes('경력')) return 'INTERMEDIATE';
    if (experience.includes('시니어')) return 'SENIOR';
    return 'ENTRY';
  }

  parseJobType(type) {
    if (type.includes('정규')) return 'FULL_TIME';
    if (type.includes('계약')) return 'CONTRACT';
    if (type.includes('인턴')) return 'INTERN';
    if (type.includes('파트')) return 'PART_TIME';
    return 'FULL_TIME';
  }

  parseSalaryInfo(salaryText) {
    const salary = {
      min: null,
      max: null,
      currency: 'KRW',
      isNegotiable: false
    };

    if (!salaryText || salaryText.includes('회사내규') || salaryText.includes('협의')) {
      salary.isNegotiable = true;
      return salary;
    }

    const numbers = salaryText.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      if (salaryText.includes('~')) {
        salary.min = parseInt(numbers[0]) * 10000;
        salary.max = parseInt(numbers[1]) * 10000;
      } else {
        salary.min = parseInt(numbers[0]) * 10000;
        salary.max = parseInt(numbers[0]) * 10000;
      }
    } else {
      salary.isNegotiable = true;
    }

    return salary;
  }

  parseDeadline(deadlineText) {
    if (deadlineText.includes('상시')) {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date;
    }

    if (deadlineText.includes('~')) {
      const dateStr = deadlineText.split('~')[1].trim();
      if (dateStr.includes('.')) {
        const [month, day] = dateStr.split('.');
        const date = new Date();
        date.setMonth(parseInt(month) - 1);
        date.setDate(parseInt(day));
        return date;
      }
    }

    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }

  async saveToJson(data, keyword) {
    try {
      const outputDir = path.join(__dirname, '../../../crawled-data');
      await fs.mkdir(outputDir, { recursive: true });

      const filename = path.join(outputDir, `saramin_${keyword}_${new Date().toISOString().split('T')[0]}.json`);
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      
      logger.info(`Results saved to ${filename}`);
      return filename;
    } catch (error) {
      logger.error('Error saving to JSON file:', error);
      throw error;
    }
  }

  async crawl(keyword, pages = 5, itemsPerPage = 20) {
    const stats = {
      totalProcessed: 0,
      newJobs: 0,
      updatedJobs: 0,
      errors: []
    };

    const crawledJobs = [];
    logger.info(`Starting crawling for keyword: ${keyword}`);

    for (let page = 1; page <= pages; page++) {
      try {
        const url = `${this.baseUrl}?searchType=search&searchword=${encodeURIComponent(keyword)}&recruitPage=${page}&recruitPageCount=${itemsPerPage}`;
        
        logger.info(`Crawling page ${page}...`);
        const html = await this.fetchWithRetry(url);
        const $ = cheerio.load(html);
        
        const jobListings = $('.item_recruit').slice(0, itemsPerPage);
        
        for (let i = 0; i < jobListings.length; i++) {
          const savedJob = await this.parseAndSaveJobListing($, jobListings[i]);
          
          if (savedJob) {
            stats.totalProcessed++;
            if (savedJob.isNew) stats.newJobs++;
            else stats.updatedJobs++;

            const company = await Company.findById(savedJob.companyId);
            const jobData = savedJob.toObject();
            jobData.company = company.toObject();
            delete jobData.companyId;
            crawledJobs.push(jobData);
          }
          
          await this.delay(this.requestDelay);
        }

        logger.info(`Page ${page} completed. Current total: ${stats.totalProcessed} jobs`);
        await this.delay(this.pageDelay);
        
      } catch (error) {
        logger.error(`Error crawling page ${page}:`, error);
        stats.errors.push({
          page,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    const results = {
      metadata: {
        keyword,
        totalJobs: crawledJobs.length,
        crawledAt: new Date(),
        stats: {
          totalProcessed: stats.totalProcessed,
          newJobs: stats.newJobs,
          updatedJobs: stats.updatedJobs,
          errorCount: stats.errors.length
        },
        errors: stats.errors
      },
      jobs: crawledJobs
    };

    await this.saveToJson(results, keyword);

    logger.info('Crawling completed', {
      keyword,
      totalProcessed: stats.totalProcessed,
      newJobs: stats.newJobs,
      updatedJobs: stats.updatedJobs,
      errors: stats.errors.length,
      savedJobs: crawledJobs.length
    });

    return {
      ...stats,
      savedJobs: crawledJobs.length,
      results
    };
  }
}

async function main() {
  try {
    await connectDB();
    
    const crawler = new SaraminCrawler();
    const keywords = ['개발자', 'python', 'javascript', 'java'];
    
    // 데이터베이스 초기화는 크롤링 시작 전 한 번만 실행
    await crawler.initializeDatabase();
    
    for (const keyword of keywords) {
      console.log(`\nStarting crawl for keyword: ${keyword}`);
      const results = await crawler.crawl(keyword, 5, 20);
      console.log(`Completed crawl for ${keyword}:`, {
        totalProcessed: results.totalProcessed,
        newJobs: results.newJobs,
        updatedJobs: results.updatedJobs,
        savedJobs: results.savedJobs,
        errors: results.errors.length
      });
    }

    console.log('\nCrawling process completed');
    process.exit(0);
  } catch (error) {
    console.error('Crawling failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SaraminCrawler;