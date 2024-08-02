"use client"
export async function checkLoginStatus() {
    const res = await fetch('http://192.168.100.199/kynan/admin/status_login.php', {
        credentials: 'include',
    });
    console.log(res)

    const data = await res.json();

    if (data.status === 'success') {
        return data.user;
    } else {
        throw new Error('User not logged in');
    }
}
