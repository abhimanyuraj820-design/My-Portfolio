import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skillIconMap = {
  'html 5': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  'css 3': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  javascript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  typescript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  'react js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  'redux toolkit': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
  'tailwind css': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
  'node js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  mongodb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  'three js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg',
  git: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  figma: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
  docker: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  'c++': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  c: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
  'c#': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
  php: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
  kotlin: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
  bootstrap: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
  angular: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
  android: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg',
  sql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
  xml: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xml/xml-original.svg',
};

const experienceSeed = [
  {
    company: 'Self Employed',
    role: 'Freelance Web Developer',
    startDate: new Date('2025-09-01T00:00:00.000Z'),
    endDate: null,
    currentJob: true,
    logoUrl: 'https://placehold.co/100x100?text=Creator',
    description:
      'Designed and developed custom websites for local clients, enhancing their brand visibility.\nBuilt Android media player apps and real-time tracking systems with focus on clean, scalable code.',
    order: 0,
  },
  {
    company: 'Digambar Jain Polytechnic',
    role: 'Diploma in Computer Science & Engineering',
    startDate: new Date('2023-09-01T00:00:00.000Z'),
    endDate: new Date('2026-08-31T00:00:00.000Z'),
    currentJob: false,
    logoUrl: 'https://placehold.co/100x100?text=Backend',
    description:
      'Pursuing Diploma in Computer Science and Engineering with coursework in Data Structures, Algorithms, DBMS and Operating Systems.',
    order: 1,
  },
  {
    company: 'Internshala Trainings',
    role: 'Programming With Python Certification',
    startDate: new Date('2025-07-01T00:00:00.000Z'),
    endDate: new Date('2025-07-31T00:00:00.000Z'),
    currentJob: false,
    logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    description:
      'Completed 6-week certified training covering Python fundamentals, OOP, SQLite, PyQT GUI and practical applications. Scored 98% and ranked top performer.',
    order: 2,
  },
];

async function backfillSkillIcons() {
  const skills = await prisma.skill.findMany();
  let updated = 0;

  for (const skill of skills) {
    if (skill.iconUrl) continue;
    const mapped = skillIconMap[String(skill.name).toLowerCase()];
    if (!mapped) continue;

    await prisma.skill.update({
      where: { id: skill.id },
      data: { iconUrl: mapped },
    });
    updated += 1;
  }

  return updated;
}

async function seedExperiencesIfEmpty() {
  const count = await prisma.experience.count();
  if (count > 0) return 0;

  for (const item of experienceSeed) {
    await prisma.experience.create({ data: item });
  }
  return experienceSeed.length;
}

async function main() {
  const updatedSkills = await backfillSkillIcons();
  const insertedExperience = await seedExperiencesIfEmpty();

  console.log(`Backfilled skill icons: ${updatedSkills}`);
  console.log(`Inserted experiences: ${insertedExperience}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
