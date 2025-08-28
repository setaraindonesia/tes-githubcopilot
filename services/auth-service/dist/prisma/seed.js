"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = await prisma.user.upsert({
        where: { username: 'test_user' },
        update: {},
        create: {
            username: 'test_user',
            email: 'test@setaradapps.com',
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'User',
            emailVerified: true,
            isActive: true,
        },
    });
    console.log('✅ Test user created:', testUser.username);
    const sampleUsers = [
        {
            username: 'alice_setara',
            email: 'alice@setaradapps.com',
            firstName: 'Alice',
            lastName: 'Johnson',
        },
        {
            username: 'bob_trader',
            email: 'bob@setaradapps.com',
            firstName: 'Bob',
            lastName: 'Smith',
        },
        {
            username: 'crypto_whale',
            email: 'whale@setaradapps.com',
            firstName: 'Crypto',
            lastName: 'Whale',
        },
    ];
    for (const userData of sampleUsers) {
        const user = await prisma.user.upsert({
            where: { username: userData.username },
            update: {},
            create: {
                ...userData,
                password: hashedPassword,
                emailVerified: true,
                isActive: true,
            },
        });
        console.log('✅ Sample user created:', user.username);
    }
    const testPassword = await bcrypt.hash('test123', 10);
    const testUsers = [
        {
            username: 'user1',
            email: 'user1@setaradapps.com',
            firstName: 'User',
            lastName: 'One',
            password: testPassword,
            emailVerified: true,
            isActive: true,
        },
        {
            username: 'user2',
            email: 'user2@setaradapps.com',
            firstName: 'User',
            lastName: 'Two',
            password: testPassword,
            emailVerified: true,
            isActive: true,
        },
    ];
    for (const userData of testUsers) {
        const user = await prisma.user.upsert({
            where: { username: userData.username },
            update: {},
            create: userData,
        });
        console.log(`✅ Test user created: ${user.username}`);
    }
    console.log('🎉 Database seeding completed!');
    console.log('\n📋 Test Users for Chat Testing:');
    console.log('👤 user1 - user1@setaradapps.com / test123');
    console.log('👤 user2 - user2@setaradapps.com / test123');
    console.log('\n🚀 Use these accounts to test real-time chat!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map