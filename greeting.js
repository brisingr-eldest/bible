const h = document.getElementById('heading');
const user = 'Jarrett';

function setGreeting() {
    const now = new Date();
    const hours = now.getHours();

    console.log("Time in hours:", hours);

    if (hours >= 5 && hours < 7) {
        h.textContent = `Up before the sun? Carpe diem, ${user}!`;
    } else if (hours >= 7 && hours < 12) {
        h.textContent = `Good morning, ${user}.`;
    } else if (hours >= 12 && hours < 17) {
        h.textContent = `Good afternoon, ${user}.`;
    } else if (hours >= 17 && hours < 20) {
        h.textContent = `Good evening, ${user}.`;
    } else {
        h.textContent = `Good night, ${user}.`;
    }
}

setGreeting();
const greetingInterval = setInterval(setGreeting, 600000);