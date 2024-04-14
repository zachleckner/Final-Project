document.addEventListener('DOMContentLoaded', function() {
    const producerLink = document.querySelector('a[href="/Producer"]');
    if (producerLink) {
        producerLink.addEventListener('click', function(event) {
            const loggedInProducerSSN = getCookie('loggedInProducer');
            if (loggedInProducerSSN) {
                producerLink.href = `/Producer2?ssn=${encodeURIComponent(loggedInProducerSSN)}`;
            }
        });
    }
});

function getCookie(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split('; ');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}