const { networkInterfaces } = require('os');
const path = require('path');
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    const nets = networkInterfaces();
    console.log('\nAvailable network access points:');
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`- ${name}: http://${net.address}:${PORT}`);
            }
        }
    }

    console.log('\nStatic files are being served from:', path.join(__dirname, '..', 'client'));
});
