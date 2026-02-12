// ===== Sample Data =====
export const wastePoints = [
    {
        id: 1,
        name: 'TPS Pasar Desa Utara',
        village: 'utara',
        lat: -8.5833,
        lng: 116.1167,
        status: 'warning', // normal, warning, danger
        capacity: 65,
        address: 'Jl. Pasar Utara No.12',
        schedule: 'Senin & Kamis, 08.00 WIB',
        lastUpdate: '2 jam yang lalu'
    },
    {
        id: 2,
        name: 'TPS Masjid Besar',
        village: 'utara',
        lat: -8.5845,
        lng: 116.1180,
        status: 'normal',
        capacity: 35,
        address: 'Jl. Masjid Raya No.5',
        schedule: 'Selasa & Jumat, 09.00 WIB',
        lastUpdate: '1 jam yang lalu'
    },
    {
        id: 3,
        name: 'TPS Sekolah Dasar',
        village: 'utara',
        lat: -8.5860,
        lng: 116.1150,
        status: 'danger',
        capacity: 92,
        address: 'Jl. Pendidikan No.8',
        schedule: 'Senin & Kamis, 10.00 WIB',
        lastUpdate: '30 menit yang lalu'
    },
    {
        id: 4,
        name: 'TPS Terminal Desa',
        village: 'utara',
        lat: -8.5820,
        lng: 116.1195,
        status: 'normal',
        capacity: 28,
        address: 'Jl. Terminal No.1',
        schedule: 'Rabu & Sabtu, 07.00 WIB',
        lastUpdate: '3 jam yang lalu'
    },
    {
        id: 5,
        name: 'TPS Puskesmas',
        village: 'utara',
        lat: -8.5880,
        lng: 116.1170,
        status: 'warning',
        capacity: 71,
        address: 'Jl. Kesehatan No.15',
        schedule: 'Selasa & Jumat, 08.30 WIB',
        lastUpdate: '1 jam yang lalu'
    },
    {
        id: 6,
        name: 'TPS Kantor Desa Selatan',
        village: 'selatan',
        lat: -8.5900,
        lng: 116.1160,
        status: 'normal',
        capacity: 15,
        address: 'Jl. Kantor Desa No.20',
        schedule: 'Senin & Kamis, 09.00 WIB',
        lastUpdate: '2 jam yang lalu'
    },
    {
        id: 7,
        name: 'TPS Balai Desa Selatan',
        village: 'selatan',
        lat: -8.5920,
        lng: 116.1145,
        status: 'danger',
        capacity: 88,
        address: 'Jl. Balai No.3',
        schedule: 'Selasa & Jumat, 10.00 WIB',
        lastUpdate: '45 menit yang lalu'
    },
    {
        id: 8,
        name: 'TPS Pasar Selatan',
        village: 'selatan',
        lat: -8.5940,
        lng: 116.1180,
        status: 'warning',
        capacity: 58,
        address: 'Jl. Pasar Selatan No.7',
        schedule: 'Rabu & Sabtu, 08.00 WIB',
        lastUpdate: '1 jam yang lalu'
    }
];

export const scheduleData = [
    {
        desa: 'Desa Sembalun Bumbung',
        desaCode: 'A',
        icon: 'location_city',
        tpsCount: 3
    },
    // {
    //     desa: 'Desa B',
    //     desaCode: 'B',
    //     icon: 'location_city',
    //     tpsCount: 2
    // }
];

// Data TPS per Desa dengan interval dan status pengambilan
export const tpsData = [
    // TPS Desa A
    {
        id: 'A1',
        name: 'TPS A1 - Pasar Utara',
        desa: 'A',
        interval: 3, // hari
        status: 'pending', // pending, active, completed
        lastPickup: '2026-01-13'
    },
    {
        id: 'A2',
        name: 'TPS A2 - Masjid Besar',
        desa: 'A',
        interval: 2,
        status: 'active',
        lastPickup: '2026-01-15'
    },
    {
        id: 'A3',
        name: 'TPS A3 - Sekolah Dasar',
        desa: 'A',
        interval: 4,
        status: 'completed',
        lastPickup: '2026-01-16'
    },
    // TPS Desa B
    {
        id: 'B1',
        name: 'TPS B1 - Terminal Selatan',
        desa: 'B',
        interval: 3,
        status: 'pending',
        lastPickup: '2026-01-14'
    },
    {
        id: 'B2',
        name: 'TPS B2 - Kantor Desa',
        desa: 'B',
        interval: 2,
        status: 'active',
        lastPickup: '2026-01-16'
    }
];