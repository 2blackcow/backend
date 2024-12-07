const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

class SaraminCrawler {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    this.baseUrl = 'https://www.saramin.co.kr/zf_user/search/recruit';
    this.retryLimit = 3;
    this.retryDelay = 2000; // 2초
    this.pageDelay = 1000; // 1초
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchWithRetry(url, retryCount = 0) {
    try {
      const response = await axios.get(url, { headers: this.headers });
      return response.data;
    } catch (error) {
      if (retryCount < this.retryLimit) {
        console.log(`Retry attempt ${retryCount + 1} for URL: ${url}`);
        await this.delay(this.retryDelay);
        return this.fetchWithRetry(url, retryCount + 1);
      }
      throw error;
    }
  }

  parseJobListing($, job) {
    try {
      return {
        company: $(job).find('.corp_name a').text().trim(),
        title: $(job).find('.job_tit a').text().trim(),
        link: 'https://www.saramin.co.kr' + $(job).find('.job_tit a').attr('href'),
        location: $(job).find('.job_condition span').eq(0).text().trim(),
        experience: $(job).find('.job_condition span').eq(1).text().trim(),
        education: $(job).find('.job_condition span').eq(2).text().trim(),
        employmentType: $(job).find('.job_condition span').eq(3).text().trim(),
        deadline: $(job).find('.job_date .date').text().trim(),
        sector: $(job).find('.job_sector').text().trim(),
        salary: $(job).find('.area_badge .badge').text().trim() || '',
        originalPostingUrl: 'https://www.saramin.co.kr' + $(job).find('.job_tit a').attr('href'),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error parsing job listing:', error);
      return null;
    }
  }

  async crawl(keyword, pages = 5) {
    const jobs = new Set(); // 중복 제거를 위한 Set 사용
    const errors = [];

    console.log(`Starting crawling for keyword: ${keyword}`);

    for (let page = 1; page <= pages; page++) {
      try {
        const url = `${this.baseUrl}?searchType=search&searchword=${encodeURIComponent(keyword)}&recruitPage=${page}`;
        
        console.log(`Crawling page ${page}...`);
        const html = await this.fetchWithRetry(url);
        const $ = cheerio.load(html);
        
        const jobListings = $('.item_recruit');
        
        jobListings.each((_, element) => {
          const job = this.parseJobListing($, element);
          if (job) {
            // 링크를 기준으로 중복 체크
            const jobKey = job.link;
            if (!Array.from(jobs).some(existingJob => existingJob.link === jobKey)) {
              jobs.add(job);
            }
          }
        });

        console.log(`Page ${page} completed. Current total: ${jobs.size} jobs`);
        
        // 다음 페이지 크롤링 전 대기
        await this.delay(this.pageDelay);
        
      } catch (error) {
        console.error(`Error crawling page ${page}:`, error.message);
        errors.push({
          page,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    // 결과 정리
    const results = {
      metadata: {
        keyword,
        totalJobs: jobs.size,
        crawledAt: new Date(),
        errors: errors
      },
      jobs: Array.from(jobs)
    };

    // JSON 파일로 저장
    const filename = `saramin_${keyword}_${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(filename, JSON.stringify(results, null, 2));

    console.log(`Crawling completed. Total jobs collected: ${jobs.size}`);
    console.log(`Results saved to ${filename}`);

    return results;
  }
}

// 실행 예시
async function main() {
  try {
    const crawler = new SaraminCrawler();
    // 여러 키워드로 크롤링하여 100개 이상의 데이터 수집
    const keywords = ['개발자', 'python', 'javascript', 'java'];
    
    for (const keyword of keywords) {
      console.log(`\nStarting crawl for keyword: ${keyword}`);
      const results = await crawler.crawl(keyword, 5); // 각 키워드당 5페이지씩
      console.log(`Completed crawl for ${keyword}: ${results.jobs.length} jobs found\n`);
    }
  } catch (error) {
    console.error('Crawling failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = SaraminCrawler;