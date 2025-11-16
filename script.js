const currentTime = document.querySelector("h1"),
content = document.querySelector(".content"),
selectMenu = document.querySelectorAll("select"),
setAlarmBtn = document.querySelector("button");

let alarmTimePause = [], alarmTimeActive = [], isAlarmSet,
ringtone = new Audio("./files/ringtone.mp3");

function createSoapAlert(message, type = "info") {
    const existingAlert = document.querySelector('.soap-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const soapAlert = document.createElement('div');
    soapAlert.className = `soap-alert soap-alert-${type}`;
    
    const messageEl = document.createElement('span');
    messageEl.className = 'soap-alert-message';
    messageEl.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'soap-alert-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => soapAlert.remove();
    
    soapAlert.appendChild(messageEl);
    soapAlert.appendChild(closeBtn);
    
    document.body.appendChild(soapAlert);
    
    setTimeout(() => {
        if (soapAlert.parentElement) {
            soapAlert.remove();
        }
    }, 5000);
    
    return soapAlert;
}

function requestNotificationPermission() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permission granted.");
            } else {
                console.log("Permission denied.");
            }
        });
    }
}
requestNotificationPermission();

function showNotification(title) {
    if (Notification.permission === "granted") {
        let notification = new Notification(title, {
            icon: "./files/alarm-clock-watch-svgrepo-com.svg",
            tag: "dup",
        });

        notification.onclick = function () {
            window.focus();
            this.close();
        };
    } else {
        console.log("Permission not granted.");
    }
}

for (let i = 1; i <= 12; i++) {
    i = i < 10 ? `0${i}` : i;
    let option = document.createElement("option");
    option.setAttribute("value", i);
    option.innerText = i;
    selectMenu[0].append(option);
}

for (let i = 1; i <= 59; i++) {
    i = i < 10 ? `0${i}` : i;
    let option = document.createElement("option");
    option.setAttribute("value", i);
    option.innerText = i;
    selectMenu[1].append(option);
}

for (let i = 1; i <= 2; i++) {
    let ampm;
    if (i == 1)
        ampm = "AM";
    else
        ampm = "PM";
    let option = document.createElement("option");
    option.setAttribute("value", ampm);
    option.innerText = ampm;
    selectMenu[2].append(option);
}

if (window.localStorage.getItem("alarmTimeActive"))
{
    alarmTimeActive = JSON.parse(window.localStorage.alarmTimeActive);
    alarmTimeActive.forEach(element => {
        alarmCheckLocal(true, element)
    });
}
if (window.localStorage.getItem("alarmTimePause"))
{
    alarmTimePause = JSON.parse(window.localStorage.alarmTimePause);
    alarmTimePause.forEach(element => {
        alarmCheckLocal(false, element)
    });
}


function alarmCheckLocal(bool, element) {
    let alarmList = document.createElement("div");
    alarmList.classList.add("alarm-list");
    
    let alarmTitle = document.createElement("h1");
    alarmTitle.classList.add("alarm-title");
    alarmTitle.textContent = `${element.slice(0, 2)}:${element.slice(3, 5)} ${element.slice(8, 11)}`;
    
    let labelSwitch = document.createElement("label");
    labelSwitch.classList.add("switch");
    labelSwitch.setAttribute("checked", bool);
    
    let inputToggle = document.createElement("input");
    inputToggle.setAttribute("type", "checkbox");
    
    let sliderRound = document.createElement("span");
    sliderRound.classList.add("slider", "round");

    let deleteIcon = document.createElement("img");
    deleteIcon.setAttribute("src", "./files/delete-svgrepo-com.svg");
    deleteIcon.classList.add("delete-icon");

    labelSwitch.appendChild(inputToggle);
    labelSwitch.appendChild(sliderRound);

    let divLabelDelete = document.createElement("div");
    divLabelDelete.className = "div-label-Delete";
    divLabelDelete.appendChild(labelSwitch);
    divLabelDelete.appendChild(deleteIcon);
    
    alarmList.appendChild(alarmTitle);
    alarmList.appendChild(divLabelDelete);

    let alarmListContainer = document.querySelector(".alarm-list-container");
    alarmListContainer.style.display = "flex";
    alarmListContainer.appendChild(alarmList);  
}

setInterval(() => {
    let date = new Date(),
    h = date.getHours(),
    m = date.getMinutes(),
    s = date.getSeconds(),
    ampm = "AM";
    if(h >= 12) {
        h = h - 12;
        ampm = "PM";
    }
    h = h == 0 ? h = 12 : h;
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    currentTime.innerText = `${h}:${m}:${s} ${ampm}`;

    if (alarmTimeActive.includes(currentTime.innerText)) {
        ringtone.play();
        ringtone.loop = true;
        
        const alarmLists = document.querySelectorAll(".alarm-list");
        
        alarmLists.forEach(alarmList => {
            const alarmTimeElement = alarmList.firstElementChild;
            const divLabelDelete = alarmTimeElement.nextElementSibling;
    
            console.log(`Checking alarm: ${alarmTimeElement.innerText} against ${currentTime.innerText}`);
            
            if (!alarmList.querySelector(".cancel-button")) {
                if (alarmTimeElement.innerText === `${h}:${m} ${ampm}`) {
                    let buttonCancel = document.createElement("button");
                    buttonCancel.classList.add("cancel-button");
                    buttonCancel.innerText = "Cancel";
    
                    if (alarmTimeElement && divLabelDelete) {
                        alarmList.insertBefore(buttonCancel, divLabelDelete);
                        
                        buttonCancel.addEventListener("click", () => {
                            ringtone.pause();
                            ringtone.currentTime = 0;
                            buttonCancel.remove();
                        });
                        console.log("Cancel button added");
                    } else {
                        console.log("Label element not found");
                    }
                }
            }
        });
        showNotification("It's time");
    }
}, 1000);

setAlarmBtn.addEventListener("click", function setAlarm() {
    let time = `${selectMenu[0].value}:${selectMenu[1].value}:00 ${selectMenu[2].value}`;
    if (time.includes("Hour") || time.includes("Minute") || time.includes("AM/PM")) {
        return createSoapAlert("Select a valid time to set Alarm!", "error");
    }
    if (alarmTimeActive.includes(time))
        return createSoapAlert("Alarm already exists!", "warning");
    alarmTimeActive.push(time);
    window.localStorage.alarmTimeActive = JSON.stringify(alarmTimeActive);

    let alarmList = document.createElement("div");
    alarmList.classList.add("alarm-list");
    
    let alarmTitle = document.createElement("h1");
    alarmTitle.classList.add("alarm-title");
    alarmTitle.textContent = `${selectMenu[0].value}:${selectMenu[1].value} ${selectMenu[2].value}`;
    
    let labelSwitch = document.createElement("label");
    labelSwitch.classList.add("switch");
    labelSwitch.setAttribute("checked", true);
    
    let inputToggle = document.createElement("input");
    inputToggle.setAttribute("type", "checkbox");
    
    let sliderRound = document.createElement("span");
    sliderRound.classList.add("slider", "round");

    let deleteIcon = document.createElement("img");
    deleteIcon.setAttribute("src", "./files/delete-svgrepo-com.svg");
    deleteIcon.classList.add("delete-icon");

    labelSwitch.appendChild(inputToggle);
    labelSwitch.appendChild(sliderRound);

    let divLabelDelete = document.createElement("div");
    divLabelDelete.className = "div-label-Delete";
    divLabelDelete.appendChild(labelSwitch);
    divLabelDelete.appendChild(deleteIcon);
    
    alarmList.appendChild(alarmTitle);
    alarmList.appendChild(divLabelDelete);

    let alarmListContainer = document.querySelector(".alarm-list-container");
    alarmListContainer.style.display = "flex";
    alarmListContainer.appendChild(alarmList);  
});

document.addEventListener("click", function(e) {
    let slider = e.target;
    let sliderParent = slider.parentNode;

    if (slider.className == "delete-icon")
    {
        let delDiv = sliderParent.parentNode;
        let label = e.target.previousElementSibling.attributes.checked.value;
        let timeToCheck = e.target.parentElement.previousElementSibling.innerText;
        
        if (label == "true")
        {
            alarmTimeActive.map(time => {
                time = time.slice(0, 5) + time.slice(8);
                if(time === timeToCheck) {
                    time = time.slice(0, 5) + ":00" + time.slice(5);
                    const index = alarmTimeActive.indexOf(time);
                    alarmTimeActive.splice(index, 1);
                    window.localStorage.alarmTimeActive = JSON.stringify(alarmTimeActive);
                    let container = delDiv.parentElement;
                    delDiv.remove();
                    if (alarmTimeActive.length == 0)
                        container.style.display = "none";
                }
            });
        }
        else {
            alarmTimePause.map(time => {
                time = time.slice(0, 5) + time.slice(8);
                if(time === timeToCheck) {
                    time = time.slice(0, 5) + ":00" + time.slice(5);
                    const index = alarmTimePause.indexOf(time);
                    alarmTimePause.splice(index, 1);
                    window.localStorage.alarmTimePause = JSON.stringify(alarmTimePause);
                    let container = delDiv.parentElement;
                    delDiv.remove();
                    if (alarmTimeActive.length == 0)
                        container.style.display = "none";
                }
            });
        }
    }

    if (slider.className == "slider round") {
        let timeToCheck = slider.parentNode.parentNode.previousElementSibling.innerText;
        if ((sliderParent.attributes.checked.value == "true"))
        {
            sliderParent.setAttribute("checked", "false");
            alarmTimeActive.map(time => {
                time = time.slice(0, 5) + time.slice(8);
                if(time === timeToCheck) {
                    time = time.slice(0, 5) + ":00" + time.slice(5);
                    alarmTimePause.push(time);
                    window.localStorage.alarmTimePause = JSON.stringify(alarmTimePause);
                    const index = alarmTimeActive.indexOf(time);
                    alarmTimeActive.splice(index, 1);
                    window.localStorage.alarmTimeActive = JSON.stringify(alarmTimeActive);
                }
            });
        }
        else {
            sliderParent.setAttribute("checked", "true");
            alarmTimePause.map(time => {
                time = time.slice(0, 5) + time.slice(8);
                if(time === timeToCheck) {
                    time = time.slice(0, 5) + ":00" + time.slice(5);
                    alarmTimeActive.push(time);
                    window.localStorage.alarmTimeActive = JSON.stringify(alarmTimeActive);
                    const index = alarmTimePause.indexOf(time);
                    alarmTimePause.splice(index, 1);
                    window.localStorage.alarmTimePause = JSON.stringify(alarmTimePause);
                }
            });
        }
    }
})