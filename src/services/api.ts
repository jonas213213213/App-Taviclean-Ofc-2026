const API_URL = 'api';

export const api = {
    // Customers
    async getCustomers() {
        const res = await fetch(`${API_URL}/customers.php`);
        return res.json();
    },
    async saveCustomer(customer: any) {
        const res = await fetch(`${API_URL}/customers.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        });
        return res.json();
    },
    async deleteCustomer(id: string) {
        const res = await fetch(`${API_URL}/customers.php?id=${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Appointments
    async getAppointments() {
        const res = await fetch(`${API_URL}/appointments.php`);
        return res.json();
    },
    async saveAppointment(appointment: any) {
        const res = await fetch(`${API_URL}/appointments.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment)
        });
        return res.json();
    },
    async deleteAppointment(id: string) {
        const res = await fetch(`${API_URL}/appointments.php?id=${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Team
    async getTeam() {
        const res = await fetch(`${API_URL}/team.php`);
        return res.json();
    },
    async saveTeamMember(member: any) {
        const res = await fetch(`${API_URL}/team.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });
        return res.json();
    },
    async deleteTeamMember(id: string) {
        const res = await fetch(`${API_URL}/team.php?id=${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Notifications
    async getNotifications() {
        const res = await fetch(`${API_URL}/notifications.php`);
        return res.json();
    },
    async saveNotification(notification: any) {
        const res = await fetch(`${API_URL}/notifications.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification)
        });
        return res.json();
    }
};
