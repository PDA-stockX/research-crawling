import cron from 'node-cron';

// 아침 10시에 실행되는 스케줄링
cron.schedule('0 9 * * *', () => {
    console.log('매일 아침 9시에 실행됩니다.');
    // 여기에 실행할 작업을 추가하세요
}, {
    timezone: "Asia/Seoul" // 시간대 설정 (예: 서울 시간대)
});
