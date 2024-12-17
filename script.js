document.addEventListener('DOMContentLoaded', () => {
    const timezones = [
        { name: 'Local Time', zone: 'auto' },
        { name: 'UTC', zone: 'UTC' },
        { name: 'New York', zone: 'America/New_York' },
        { name: 'Los Angeles', zone: 'America/Los_Angeles' },
        { name: 'London', zone: 'Europe/London' },
        { name: 'Paris', zone: 'Europe/Paris' },
        { name: 'Tokyo', zone: 'Asia/Tokyo' },
        { name: 'Sydney', zone: 'Australia/Sydney' },
        { name: 'Dubai', zone: 'Asia/Dubai' },
        { name: 'São Paulo', zone: 'America/Sao_Paulo' }
    ];

    // Tab Navigation
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // World Clock Functionality
    const populateTimezoneSelects = () => {
        const selects = document.querySelectorAll('.timezone-select');
        selects.forEach((select, index) => {
            select.innerHTML = '';
            timezones.forEach((tz, idx) => {
                const option = document.createElement('option');
                option.value = tz.zone;
                option.textContent = tz.name;
                
                // Set default selections
                if ((index === 0 && idx === 0) || (index === 1 && idx === 3)) {
                    option.selected = true;
                }
                
                select.appendChild(option);
            });

            // Add change event listener to update clock
            select.addEventListener('change', () => updateClockForContainer(select.closest('.clock-container')));
        });
    };

    const updateClock = (hourHand, minuteHand, secondHand, digitalDisplay, timezone) => {
        const now = timezone === 'auto' 
            ? new Date() 
            : new Date().toLocaleString('en-US', { timeZone: timezone });

        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Analog clock hands rotation
        hourHand.style.transform = `translateX(-50%) rotate(${(hours + minutes/60) * 30}deg)`;
        minuteHand.style.transform = `translateX(-50%) rotate(${(minutes + seconds/60) * 6}deg)`;
        secondHand.style.transform = `translateX(-50%) rotate(${seconds * 6}deg)`;

        // Digital time display
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true,
            timeZone: timezone === 'auto' ? undefined : timezone
        });
        digitalDisplay.textContent = timeString;
    };

    const updateClockForContainer = (container) => {
        const timezone = container.querySelector('.timezone-select').value;
        const hourHand = container.querySelector('.hour-hand');
        const minuteHand = container.querySelector('.minute-hand');
        const secondHand = container.querySelector('.second-hand');
        const digitalDisplay = container.querySelector('.digital-time');

        updateClock(hourHand, minuteHand, secondHand, digitalDisplay, timezone);
    };

    const startWorldClockUpdates = () => {
        const clockContainers = document.querySelectorAll('.clock-container');
        
        // Initial update
        clockContainers.forEach(updateClockForContainer);

        // Continuous updates
        setInterval(() => {
            clockContainers.forEach(updateClockForContainer);
        }, 1000);
    };

    // Stopwatch Functionality
    let stopwatchInterval, stopwatchStartTime, stopwatchPaused = false;
    const stopwatchDisplay = document.getElementById('stopwatchDisplay');
    const startStopwatchBtn = document.getElementById('startStopwatch');
    const lapStopwatchBtn = document.getElementById('lapStopwatch');
    const resetStopwatchBtn = document.getElementById('resetStopwatch');
    const lapsList = document.getElementById('lapsList');

    const formatTime = (ms) => {
        const pad = (n) => n.toString().padStart(2, '0');
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = ms % 1000;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${milliseconds.toString().padStart(3, '0')}`;
    };

    startStopwatchBtn.addEventListener('click', () => {
        if (!stopwatchInterval) {
            // Start
            stopwatchStartTime = Date.now() - (stopwatchPaused ? stopwatchPaused : 0);
            stopwatchInterval = setInterval(() => {
                const elapsed = Date.now() - stopwatchStartTime;
                stopwatchDisplay.textContent = formatTime(elapsed);
            }, 10);
            startStopwatchBtn.textContent = 'Pause';
            stopwatchPaused = false;
        } else {
            // Pause
            clearInterval(stopwatchInterval);
            stopwatchPaused = Date.now() - stopwatchStartTime;
            stopwatchInterval = null;
            startStopwatchBtn.textContent = 'Resume';
        }
    });

    lapStopwatchBtn.addEventListener('click', () => {
        if (stopwatchInterval) {
            const lapTime = stopwatchDisplay.textContent;
            const lapItem = document.createElement('div');
            lapItem.textContent = `Lap ${lapsList.children.length + 1}: ${lapTime}`;
            lapsList.appendChild(lapItem);
        }
    });

    resetStopwatchBtn.addEventListener('click', () => {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchDisplay.textContent = '00:00:00.000';
        stopwatchPaused = false;
        lapsList.innerHTML = '';
        startStopwatchBtn.textContent = 'Start';
    });

    // Timer Functionality
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const timerDisplay = document.getElementById('timerDisplay');
    const startTimerBtn = document.getElementById('startTimer');
    let timerInterval, timerRemaining;

    startTimerBtn.addEventListener('click', () => {
        if (timerInterval) {
            // Pause
            clearInterval(timerInterval);
            startTimerBtn.textContent = 'Resume';
            timerInterval = null;
            return;
        }

        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;

        // Calculate total seconds
        timerRemaining = hours * 3600 + minutes * 60 + seconds;

        if (timerRemaining <= 0) {
            alert('Please enter a valid time');
            return;
        }

        startTimerBtn.textContent = 'Pause';

        timerInterval = setInterval(() => {
            timerRemaining--;

            if (timerRemaining < 0) {
                clearInterval(timerInterval);
                showModal('Timer Finished', 'Your countdown has completed!');
                startTimerBtn.textContent = 'Start';
                timerInterval = null;
                return;
            }

            const hrs = Math.floor(timerRemaining / 3600);
            const mins = Math.floor((timerRemaining % 3600) / 60);
            const secs = timerRemaining % 60;

            timerDisplay.textContent = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    });

    // Alarm Functionality
    const alarmTimeInput = document.getElementById('alarmTime');
    const setAlarmBtn = document.getElementById('setAlarmBtn');
    const snoozeAlarmBtn = document.getElementById('snoozeAlarmBtn');
    let alarmTimeout;

    setAlarmBtn.addEventListener('click', () => {
        const alarmTime = alarmTimeInput.value;
        if (!alarmTime) {
            alert('Please select an alarm time');
            return;
        }

        // Clear any existing alarm
        if (alarmTimeout) clearTimeout(alarmTimeout);

        const now = new Date();
        const [hours, minutes] = alarmTime.split(':').map(Number);
        
        // Create alarm date
        const alarmDate = new Date(
            now.getFullYear(), 
            now.getMonth(), 
            now.getDate(), 
            hours, 
            minutes
        );

        // If alarm time is earlier than current time, set for next day
        if (alarmDate <= now) {
            alarmDate.setDate(alarmDate.getDate() + 1);
        }

        // Calculate time difference
        const timeDiff = alarmDate - now;

        // Set timeout for alarm
        alarmTimeout = setTimeout(() => {
            showModal('Alarm', 'Time to wake up!');
        }, timeDiff);

        // Provide feedback to user
        const formattedAlarmTime = alarmDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        alert(`Alarm set for ${formattedAlarmTime}`);
    });

    snoozeAlarmBtn.addEventListener('click', () => {
        // Snooze for 5 minutes
        const snoozeTime = new Date(Date.now() + 5 * 60000);
        
        if (alarmTimeout) clearTimeout(alarmTimeout);

        alarmTimeout = setTimeout(() => {
            showModal('Alarm', 'Snooze time is over!');
        }, 5 * 60000);

        const formattedSnoozeTime = snoozeTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        alert(`Alarm snoozed. Will ring again at ${formattedSnoozeTime}`);
    });

    // Modal Functionality
    const modal = document.getElementById('alertModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const dismissModalBtn = document.getElementById('dismissModal');

    const showModal = (title, message) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'block';
    };

    dismissModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Window click outside modal to close
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initialize application
    populateTimezoneSelects();
    startWorldClockUpdates();
});
