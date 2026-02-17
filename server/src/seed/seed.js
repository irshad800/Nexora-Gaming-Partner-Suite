require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Import models
const User = require('../models/User');
const Agent = require('../models/Agent');
const Affiliate = require('../models/Affiliate');
const Player = require('../models/Player');
const Commission = require('../models/Commission');
const Withdrawal = require('../models/Withdrawal');
const Click = require('../models/Click');
const Referral = require('../models/Referral');

/**
 * Generate a random number between min and max (inclusive)
 */
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generate a random date within the last N days
 */
const randomDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - random(0, daysAgo));
    date.setHours(random(0, 23), random(0, 59), random(0, 59));
    return date;
};

/**
 * Sample data arrays for realistic dummy data
 */
const playerNames = [
    'Alex Johnson', 'Maria Garcia', 'James Wilson', 'Sarah Brown',
    'Michael Davis', 'Emma Martinez', 'Robert Anderson', 'Olivia Thomas',
    'William Jackson', 'Sophia White', 'David Harris', 'Isabella Clark',
    'Richard Lewis', 'Mia Robinson', 'Joseph Walker', 'Charlotte Hall',
    'Thomas Allen', 'Amelia Young', 'Daniel King', 'Harper Wright',
];

const countries = ['AE', 'US', 'UK', 'IN', 'PH', 'BR', 'DE', 'FR', 'CA', 'AU'];
const ips = [
    '192.168.1.45', '10.0.0.23', '172.16.0.101', '203.45.67.89',
    '156.78.90.12', '89.123.45.67', '45.67.89.101', '178.90.12.34',
    '67.89.101.23', '134.56.78.90',
];
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Safari/605.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148',
    'Mozilla/5.0 (Linux; Android 14) Chrome/120.0',
    'Mozilla/5.0 (iPad; CPU OS 17_0) AppleWebKit/605.1',
];

/**
 * Main seed function
 * Creates realistic dummy data for all collections
 */
const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('\n🌱 Starting database seed...\n');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Agent.deleteMany({}),
            Affiliate.deleteMany({}),
            Player.deleteMany({}),
            Commission.deleteMany({}),
            Withdrawal.deleteMany({}),
            Click.deleteMany({}),
            Referral.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing data');

        // =============================
        // 1. Create Admin User
        // =============================
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@nexora.com',
            password: 'admin123',
            role: 'admin',
            phone: '+971501234567',
            status: 'active',
        });
        console.log('👑 Created admin user');

        // =============================
        // 2. Create Agent Users + Profiles
        // =============================
        const agentUsers = await User.create([
            {
                name: 'Ahmed Al-Rashid',
                email: 'agent@nexora.com',
                password: 'agent123',
                role: 'agent',
                phone: '+971502345678',
                status: 'active',
            },
            {
                name: 'Fatima Hassan',
                email: 'agent2@nexora.com',
                password: 'agent123',
                role: 'agent',
                phone: '+971503456789',
                status: 'active',
            },
        ]);

        const agents = await Agent.create([
            {
                userId: agentUsers[0]._id,
                agentCode: 'AGT-001',
                commissionRate: 10,
                totalEarnings: 0,
                pendingCommission: 0,
                withdrawableBalance: 0,
                totalWithdrawn: 0,
                totalUsers: 0,
                bio: 'Top-performing agent specializing in high-value player acquisition.',
            },
            {
                userId: agentUsers[1]._id,
                agentCode: 'AGT-002',
                commissionRate: 10,
                totalEarnings: 0,
                pendingCommission: 0,
                withdrawableBalance: 0,
                totalWithdrawn: 0,
                totalUsers: 0,
                bio: 'Regional agent with focus on Middle East market.',
            },
        ]);
        console.log('🕵️  Created 2 agent users');

        // =============================
        // 3. Create Affiliate Users + Profiles
        // =============================
        const affiliateUsers = await User.create([
            {
                name: 'Ryan Cooper',
                email: 'affiliate@nexora.com',
                password: 'affiliate123',
                role: 'affiliate',
                phone: '+971504567890',
                status: 'active',
            },
            {
                name: 'Luna Martinez',
                email: 'affiliate2@nexora.com',
                password: 'affiliate123',
                role: 'affiliate',
                phone: '+971505678901',
                status: 'active',
            },
        ]);

        const affiliates = await Affiliate.create([
            {
                userId: affiliateUsers[0]._id,
                referralCode: 'RYAN2024',
                revenueSharePercent: 25,
                totalClicks: 0,
                totalRegistrations: 0,
                totalDeposits: 0,
                totalEarnings: 0,
                withdrawableBalance: 0,
                totalWithdrawn: 0,
                website: 'https://gaming-promos.com',
                bio: 'Digital marketing expert specializing in gaming affiliate programs.',
            },
            {
                userId: affiliateUsers[1]._id,
                referralCode: 'LUNA2024',
                revenueSharePercent: 25,
                totalClicks: 0,
                totalRegistrations: 0,
                totalDeposits: 0,
                totalEarnings: 0,
                withdrawableBalance: 0,
                totalWithdrawn: 0,
                website: 'https://bet-reviews.net',
                bio: 'Content creator and SEO specialist for iGaming industry.',
            },
        ]);
        console.log('🔗 Created 2 affiliate users');

        // =============================
        // 4. Create Players (distributed across agents)
        // =============================
        const players = [];
        for (let i = 0; i < 20; i++) {
            const agentIndex = i < 12 ? 0 : 1; // 12 for agent 1, 8 for agent 2
            const totalWagered = random(500, 50000);
            const totalLost = Math.round(totalWagered * (random(20, 60) / 100));
            const totalWon = totalWagered - totalLost;

            players.push({
                name: playerNames[i],
                email: `${playerNames[i].toLowerCase().replace(/\s/g, '.')}@email.com`,
                phone: `+97150${random(1000000, 9999999)}`,
                agentId: agents[agentIndex]._id,
                status: i % 7 === 0 ? 'blocked' : 'active',
                totalWagered,
                totalLost,
                totalWon,
                lastActive: randomDate(30),
                country: countries[random(0, countries.length - 1)],
            });
        }
        const createdPlayers = await Player.create(players);
        console.log('🎮 Created 20 players');

        // =============================
        // 5. Create Commissions (60+ records over 30 days)
        // =============================
        const commissions = [];
        let agent1TotalEarnings = 0;
        let agent2TotalEarnings = 0;

        for (let day = 0; day < 30; day++) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            date.setHours(12, 0, 0, 0);

            // Generate 2-4 commission entries per day
            const entriesPerDay = random(2, 4);
            for (let j = 0; j < entriesPerDay; j++) {
                const playerIndex = random(0, createdPlayers.length - 1);
                const player = createdPlayers[playerIndex];
                const agentIndex = playerIndex < 12 ? 0 : 1;
                const agent = agents[agentIndex];
                const playerLoss = random(50, 2000);
                const commissionAmount = Math.round(playerLoss * (agent.commissionRate / 100) * 100) / 100;

                commissions.push({
                    agentId: agent._id,
                    playerId: player._id,
                    amount: commissionAmount,
                    playerLoss,
                    commissionRate: agent.commissionRate,
                    type: 'loss_commission',
                    date,
                    status: day > 3 ? 'credited' : 'pending',
                    description: `Commission on ${player.name}'s activity`,
                });

                if (agentIndex === 0) {
                    agent1TotalEarnings += commissionAmount;
                } else {
                    agent2TotalEarnings += commissionAmount;
                }
            }
        }
        await Commission.create(commissions);
        console.log(`💰 Created ${commissions.length} commission records`);

        // Calculate pending vs credited for each agent
        const agent1Pending = commissions
            .filter((c) => c.agentId.toString() === agents[0]._id.toString() && c.status === 'pending')
            .reduce((sum, c) => sum + c.amount, 0);
        const agent2Pending = commissions
            .filter((c) => c.agentId.toString() === agents[1]._id.toString() && c.status === 'pending')
            .reduce((sum, c) => sum + c.amount, 0);

        // =============================
        // 6. Create Withdrawals
        // =============================
        const withdrawals = [];
        const agent1Withdrawn = random(500, 2000);
        const agent2Withdrawn = random(300, 1000);

        // Agent withdrawals
        withdrawals.push(
            {
                userId: agentUsers[0]._id,
                userRole: 'agent',
                amount: agent1Withdrawn,
                status: 'approved',
                paymentMethod: 'bank_transfer',
                paymentDetails: 'Emirates NBD - ****4521',
                processedAt: randomDate(10),
                processedBy: admin._id,
                transactionId: `TXN-${random(100000, 999999)}`,
            },
            {
                userId: agentUsers[0]._id,
                userRole: 'agent',
                amount: random(100, 500),
                status: 'pending',
                paymentMethod: 'bank_transfer',
                paymentDetails: 'Emirates NBD - ****4521',
            },
            {
                userId: agentUsers[1]._id,
                userRole: 'agent',
                amount: agent2Withdrawn,
                status: 'approved',
                paymentMethod: 'crypto',
                paymentDetails: 'BTC: bc1q...x7k9',
                processedAt: randomDate(15),
                processedBy: admin._id,
                transactionId: `TXN-${random(100000, 999999)}`,
            }
        );

        // Affiliate withdrawals
        withdrawals.push(
            {
                userId: affiliateUsers[0]._id,
                userRole: 'affiliate',
                amount: random(200, 800),
                status: 'approved',
                paymentMethod: 'e_wallet',
                paymentDetails: 'PayPal: ryan@email.com',
                processedAt: randomDate(7),
                processedBy: admin._id,
                transactionId: `TXN-${random(100000, 999999)}`,
            },
            {
                userId: affiliateUsers[0]._id,
                userRole: 'affiliate',
                amount: random(100, 400),
                status: 'pending',
                paymentMethod: 'e_wallet',
                paymentDetails: 'PayPal: ryan@email.com',
            },
            {
                userId: affiliateUsers[0]._id,
                userRole: 'affiliate',
                amount: random(50, 200),
                status: 'rejected',
                paymentMethod: 'bank_transfer',
                paymentDetails: 'Chase - ****8901',
                processedAt: randomDate(20),
                processedBy: admin._id,
                rejectionReason: 'Insufficient balance at time of processing',
            },
            {
                userId: affiliateUsers[1]._id,
                userRole: 'affiliate',
                amount: random(150, 600),
                status: 'approved',
                paymentMethod: 'crypto',
                paymentDetails: 'USDT TRC20: T...abc',
                processedAt: randomDate(12),
                processedBy: admin._id,
                transactionId: `TXN-${random(100000, 999999)}`,
            }
        );
        await Withdrawal.create(withdrawals);
        console.log(`💸 Created ${withdrawals.length} withdrawal records`);

        // =============================
        // 7. Create Clicks (200+ records)
        // =============================
        const clicks = [];
        for (let i = 0; i < 250; i++) {
            const affiliateIndex = i < 160 ? 0 : 1;
            clicks.push({
                affiliateId: affiliates[affiliateIndex]._id,
                referralCode: affiliates[affiliateIndex].referralCode,
                ip: ips[random(0, ips.length - 1)],
                userAgent: userAgents[random(0, userAgents.length - 1)],
                country: countries[random(0, countries.length - 1)],
                source: ['google', 'facebook', 'twitter', 'direct', 'youtube'][random(0, 4)],
                converted: i % 8 === 0,
                timestamp: randomDate(30),
            });
        }
        const createdClicks = await Click.create(clicks);
        console.log(`🖱️  Created ${clicks.length} click records`);

        // =============================
        // 8. Create Referrals (30 records with funnel data)
        // =============================
        const referralNames = [
            'Noah Smith', 'Ava Williams', 'Liam Brown', 'Sophia Jones',
            'Mason Taylor', 'Isabella Davis', 'Ethan Miller', 'Mia Wilson',
            'Lucas Moore', 'Aria Anderson', 'Logan Thomas', 'Ella Jackson',
            'Aiden Martin', 'Chloe Lee', 'Elijah Perez', 'Grace Thompson',
            'Oliver White', 'Lily Harris', 'Benjamin Clark', 'Zoe Lewis',
            'Henry Robinson', 'Nora Walker', 'Sebastian Hall', 'Riley Allen',
            'Jack Young', 'Scarlett King', 'Carter Wright', 'Violet Hill',
            'Owen Scott', 'Penelope Green',
        ];

        const referrals = [];
        let aff1Registrations = 0;
        let aff1Deposits = 0;
        let aff1Revenue = 0;
        let aff2Registrations = 0;
        let aff2Deposits = 0;
        let aff2Revenue = 0;

        for (let i = 0; i < 30; i++) {
            const affiliateIndex = i < 20 ? 0 : 1;
            const affiliate = affiliates[affiliateIndex];
            const hasDeposit = i % 3 !== 2; // ~66% make a deposit
            const depositAmount = hasDeposit ? random(50, 500) : 0;
            const revenue = hasDeposit ? Math.round(depositAmount * (affiliate.revenueSharePercent / 100) * 100) / 100 : 0;
            const registeredAt = randomDate(30);

            referrals.push({
                affiliateId: affiliate._id,
                clickId: createdClicks[random(0, createdClicks.length - 1)]._id,
                referralCode: affiliate.referralCode,
                playerName: referralNames[i],
                email: `${referralNames[i].toLowerCase().replace(/\s/g, '.')}@email.com`,
                registered: true,
                registeredAt,
                firstDeposit: hasDeposit,
                depositAmount,
                depositAt: hasDeposit ? new Date(registeredAt.getTime() + random(1, 48) * 3600000) : null,
                revenueGenerated: revenue,
                status: hasDeposit ? 'deposited' : 'registered',
            });

            if (affiliateIndex === 0) {
                aff1Registrations++;
                if (hasDeposit) { aff1Deposits++; aff1Revenue += revenue; }
            } else {
                aff2Registrations++;
                if (hasDeposit) { aff2Deposits++; aff2Revenue += revenue; }
            }
        }
        await Referral.create(referrals);
        console.log(`📨 Created ${referrals.length} referral records`);

        // =============================
        // 9. Update Agent Aggregates
        // =============================
        await Agent.findByIdAndUpdate(agents[0]._id, {
            totalEarnings: Math.round(agent1TotalEarnings * 100) / 100,
            pendingCommission: Math.round(agent1Pending * 100) / 100,
            withdrawableBalance: Math.round((agent1TotalEarnings - agent1Pending - agent1Withdrawn) * 100) / 100,
            totalWithdrawn: agent1Withdrawn,
            totalUsers: 12,
        });
        await Agent.findByIdAndUpdate(agents[1]._id, {
            totalEarnings: Math.round(agent2TotalEarnings * 100) / 100,
            pendingCommission: Math.round(agent2Pending * 100) / 100,
            withdrawableBalance: Math.round((agent2TotalEarnings - agent2Pending - agent2Withdrawn) * 100) / 100,
            totalWithdrawn: agent2Withdrawn,
            totalUsers: 8,
        });
        console.log('📊 Updated agent aggregate stats');

        // =============================
        // 10. Update Affiliate Aggregates
        // =============================
        const aff1ApprovedWithdrawals = withdrawals
            .filter((w) => w.userId.toString() === affiliateUsers[0]._id.toString() && w.status === 'approved')
            .reduce((sum, w) => sum + w.amount, 0);
        const aff2ApprovedWithdrawals = withdrawals
            .filter((w) => w.userId.toString() === affiliateUsers[1]._id.toString() && w.status === 'approved')
            .reduce((sum, w) => sum + w.amount, 0);

        await Affiliate.findByIdAndUpdate(affiliates[0]._id, {
            totalClicks: 160,
            totalRegistrations: aff1Registrations,
            totalDeposits: aff1Deposits,
            totalEarnings: Math.round(aff1Revenue * 100) / 100,
            withdrawableBalance: Math.round((aff1Revenue - aff1ApprovedWithdrawals) * 100) / 100,
            totalWithdrawn: aff1ApprovedWithdrawals,
        });
        await Affiliate.findByIdAndUpdate(affiliates[1]._id, {
            totalClicks: 90,
            totalRegistrations: aff2Registrations,
            totalDeposits: aff2Deposits,
            totalEarnings: Math.round(aff2Revenue * 100) / 100,
            withdrawableBalance: Math.round((aff2Revenue - aff2ApprovedWithdrawals) * 100) / 100,
            totalWithdrawn: aff2ApprovedWithdrawals,
        });
        console.log('📊 Updated affiliate aggregate stats');

        // =============================
        // Summary
        // =============================
        console.log('\n✅ Database seeded successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin:     admin@nexora.com      / admin123');
        console.log('Agent 1:   agent@nexora.com      / agent123');
        console.log('Agent 2:   agent2@nexora.com     / agent123');
        console.log('Affiliate: affiliate@nexora.com  / affiliate123');
        console.log('Affiliate: affiliate2@nexora.com / affiliate123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
