
/* Notifications */
function showNotification(title, message, duration = 3000) {
    // Record into the notification-center history (persisted for the quick
    // settings "Benachrichtigungen" tab).
    if (typeof window !== 'undefined') {
        if (!Array.isArray(window.webosNotificationHistory)) window.webosNotificationHistory = [];
        window.webosNotificationHistory.push({ title, message, time: Date.now() });
        if (window.webosNotificationHistory.length > 100) {
            window.webosNotificationHistory.splice(0, window.webosNotificationHistory.length - 100);
        }
        if (typeof window.webosOnNewNotification === 'function') {
            try { window.webosOnNewNotification(); } catch (e) {}
        }
    }

    // "Do not disturb" suppresses the visible toast but still keeps history.
    if (typeof window !== 'undefined' && window.webosDndEnabled) return;

    const container = document.getElementById('notification-area');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'notification-toast';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'notification-title';
    titleDiv.textContent = title;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'notification-message';
    msgDiv.textContent = message;

    toast.appendChild(titleDiv);
    toast.appendChild(msgDiv);

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300); // Wait for transition
    }, duration);

    // Allow click to dismiss
    toast.onclick = () => {
         toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    };
}
