const koreanTime = (date) => {
    const timeZoneOffset = 9 * 60 * 60 * 1000;
    const koreanTime = new Date(date.getTime() + timeZoneOffset);
    return koreanTime;
}

const str2date = (dateString) => {
    const year = parseInt(dateString.substring(0, 2), 10);
    const month = parseInt(dateString.substring(3, 5), 10) - 1;
    const day = parseInt(dateString.substring(6), 10);

    const date = new Date(2000 + year, month, day);
    return koreanTime(date);
}

const date2str = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 해줍니다.
    const day = String(date.getDate()).padStart(2, '0');

    const dateString = `${year}${month}${day}`;
    return dateString;
}

export { str2date, date2str };