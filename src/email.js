// src/email.js - Email notification functions using SendGrid

// Formats downtime duration from milliseconds to human-readable string
function formatDowntime(milliseconds) {
    if (!milliseconds) return "N/A";

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h`;
    }
    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
    if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
}

// Generates HTML table for status changes
function generateStatusChangesTable(statusChanges) {
    if (!statusChanges || statusChanges.length === 0) {
        return "<p>No status changes detected.</p>";
    }

    let html = `
        <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Monitor</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Status Change</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Downtime</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Error</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Timestamp</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const change of statusChanges) {
        const statusColor = change.newStatus === 'healthy' ? '#4CAF50' : '#f44336';
        const statusText = change.newStatus === 'healthy'
            ? '🟢 Unhealthy → Healthy'
            : '🔴 Healthy → Unhealthy';

        html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 12px;">${change.monitorName}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; color: ${statusColor}; font-weight: bold;">${statusText}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${formatDowntime(change.downtimeDuration)}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${change.error || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${new Date(change.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST</td>
                </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    return html;
}

// Sends email notification via SendGrid
export async function sendStatusChangeEmail(sendgridApiKey, statusChanges) {
    if (!statusChanges || statusChanges.length === 0) {
        console.log("No status changes to email");
        return;
    }

    const tableHtml = generateStatusChangesTable(statusChanges);

    const emailBody = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h2 { color: #333; }
                </style>
            </head>
            <body>
                <h2>Health Check Status Changes</h2>
                <p>The following monitors experienced status changes:</p>
                ${tableHtml}
                <br>
                <p style="color: #666; font-size: 12px;">
                    This is an automated notification from the Healthcheck Monitoring System.
                </p>
            </body>
        </html>
    `;

    const emailData = {
        personalizations: [
            {
                to: [{ email: "devops@amoga.io" }],
                subject: `Health Check Status Changes - ${statusChanges.length} monitor(s) affected`
            }
        ],
        from: { email: "noreply@amoga.io", name: "Healthcheck Monitor" },
        content: [
            {
                type: "text/html",
                value: emailBody
            }
        ]
    };

    try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${sendgridApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("SendGrid API error:", response.status, errorText);
            throw new Error(`SendGrid API error: ${response.status}`);
        }

        console.log(`Status change email sent successfully to devops@amoga.io (${statusChanges.length} changes)`);
    } catch (error) {
        console.error("Failed to send status change email:", error);
        throw error;
    }
}
