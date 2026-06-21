function calculateStatusTPSRealtime(tps) {
    // Jika kapasitas 0, status default normal
    if (!tps.kapasitas || tps.kapasitas === 0) {
        return 'normal';
    }

    const persentase = tps.persentase_sampah || 0;

    // Logika status berdasarkan persentase
    if (persentase >= 80) {
        return 'penuh';
    } else if (persentase >= 50) {
        return 'hampir_penuh';
    } else {
        return 'normal';
    }
}

module.exports = {
    calculateStatusTPSRealtime
};
