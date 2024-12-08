const cron = require('node-cron');
const SaraminCrawler = require('./saraminCrawler');
const Job = require('../../models/Job');
const Company = require('../../models/Company');
const logger = require('../logger');

class CrawlerScheduler {
  constructor() {
    this.crawler = new SaraminCrawler();
    this.keywords = process.env.CRAWLER_KEYWORDS.split(',');
    this.isRunning = false;
  }

  async start() {
    // 크롤링 스케줄 설정 (매일 새벽 2시에 실행)
    cron.schedule(process.env.CRAWLER_SCHEDULE || '0 2 * * *', async () => {
      try {
        await this.runCrawling();
      } catch (error) {
        logger.error('Crawler schedule failed:', error);
      }
    });

    // 초기 실행
    if (process.env.CRAWLER_RUN_ON_START === 'true') {
      await this.runCrawling();
    }
  }

  async runCrawling() {
    if (this.isRunning) {
      logger.warn('Crawler is already running');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    let totalJobs = 0;
    let newJobs = 0;
    let updatedJobs = 0;
    let errors = [];

    try {
      logger.info('Starting crawler job');

      for (const keyword of this.keywords) {
        try {
          const results = await this.crawler.crawl(
            keyword, 
            parseInt(process.env.CRAWLER_PAGES_PER_KEYWORD)
          );

          totalJobs += results.jobs.length;

          // 각 채용공고 처리
          for (const jobData of results.jobs) {
            try {
              // 회사 정보 처리
              const company = await this.processCompany(jobData);

              // 채용공고 처리
              const jobResult = await this.processJob(jobData, company._id);
              if (jobResult.isNew) newJobs++;
              if (jobResult.isUpdated) updatedJobs++;

            } catch (error) {
              errors.push({
                jobUrl: jobData.link,
                error: error.message
              });
              logger.error(`Error processing job ${jobData.link}:`, error);
            }
          }

          // 키워드 간 딜레이
          await this.delay(parseInt(process.env.CRAWLER_KEYWORD_DELAY));

        } catch (error) {
          errors.push({
            keyword,
            error: error.message
          });
          logger.error(`Error crawling keyword ${keyword}:`, error);
        }
      }

      // 크롤링 결과 로깅
      const duration = (Date.now() - startTime) / 1000;
      logger.info('Crawler job completed', {
        totalJobs,
        newJobs,
        updatedJobs,
        duration,
        errorCount: errors.length
      });

      // 오래된 채용공고 처리
      await this.handleExpiredJobs();

    } catch (error) {
      logger.error('Crawler job failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async processCompany(jobData) {
    const companyData = {
      companyName: jobData.company,
      industry: jobData.sector || '미분류',
      location: {
        address: jobData.location,
        city: jobData.location.split(' ')[0]
      }
    };

    // 회사 정보 업데이트 또는 생성
    return await Company.findOneAndUpdate(
      { companyName: companyData.companyName },
      { $set: companyData },
      { upsert: true, new: true }
    );
  }

  async processJob(jobData, companyId) {
    const jobDocument = {
      companyId,
      title: jobData.title,
      description: jobData.description || '',
      location: {
        address: jobData.location,
        city: jobData.location.split(' ')[0]
      },
      experienceLevel: this.parseExperienceLevel(jobData.experience),
      jobType: this.parseJobType(jobData.employmentType),
      skills: jobData.skills || [],
      deadline: this.parseDeadline(jobData.deadline),
      salary: this.parseSalary(jobData.salary),
      originalPostingUrl: jobData.link,
      requirements: jobData.requirements || [],
      status: 'ACTIVE'
    };

    // 채용공고 업데이트 또는 생성
    const existingJob = await Job.findOne({ originalPostingUrl: jobData.link });

    if (!existingJob) {
      await Job.create(jobDocument);
      return { isNew: true, isUpdated: false };
    }

    const isChanged = JSON.stringify(existingJob.toObject()) !== JSON.stringify(jobDocument);
    if (isChanged) {
      await Job.findByIdAndUpdate(existingJob._id, { $set: jobDocument });
      return { isNew: false, isUpdated: true };
    }

    return { isNew: false, isUpdated: false };
  }

  async handleExpiredJobs() {
    const expiryDays = parseInt(process.env.JOB_EXPIRY_DAYS || '30');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - expiryDays);

    await Job.updateMany(
      {
        updatedAt: { $lt: expiryDate },
        status: 'ACTIVE'
      },
      {
        $set: { status: 'CLOSED' }
      }
    );
  }

  parseExperienceLevel(experience) {
    if (!experience) return 'ENTRY';
    if (experience.includes('신입')) return 'ENTRY';
    if (experience.includes('경력')) return 'INTERMEDIATE';
    if (experience.includes('시니어')) return 'SENIOR';
    return 'ENTRY';
  }

  parseJobType(type) {
    if (!type) return 'FULL_TIME';
    if (type.includes('정규')) return 'FULL_TIME';
    if (type.includes('계약')) return 'CONTRACT';
    if (type.includes('인턴')) return 'INTERN';
    if (type.includes('파트')) return 'PART_TIME';
    return 'FULL_TIME';
  }

  parseDeadline(deadline) {
    if (!deadline) return null;
    if (deadline.includes('상시')) {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date;
    }
    try {
      const [month, day] = deadline.split('/');
      const date = new Date();
      date.setMonth(parseInt(month) - 1);
      date.setDate(parseInt(day));
      return date;
    } catch {
      return null;
    }
  }

  parseSalary(salary) {
    if (!salary) return {};
    const result = {
      currency: 'KRW'
    };
    
    try {
      const amount = parseInt(salary.replace(/[^0-9]/g, ''));
      if (amount) {
        result.min = amount;
        result.max = amount;
      }
    } catch {
      // 급여 파싱 실패 시 빈 객체 반환
    }

    return result;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new CrawlerScheduler();