import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Rubric from '../models/Rubric.js';
import ProjectEvaluation from '../models/ProjectEvaluation.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Clearing existing data...');
    await ProjectEvaluation.deleteMany();
    await Rubric.deleteMany();
    await User.deleteMany();

    console.log('[Seeder] Creating users...');
    // Create Teacher
    const teacher = await User.create({
      name: 'Dr. Evelyn Reed',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'teacher',
    });

    // Create Student 1 (Alex)
    const studentAlex = await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'password123',
      role: 'student',
    });

    // Create Student 2 (Sarah)
    const studentSarah = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'student',
    });

    console.log('[Seeder] Creating rubrics...');
    // Rubric 1: Full-Stack Web Development
    const webRubric = await Rubric.create({
      title: 'Full-Stack Web Engineering Rubric',
      description: 'Comprehensive evaluation criteria for end-to-end full stack web applications with modern UI and robust backend architecture.',
      createdBy: teacher._id,
      criteria: [
        {
          name: 'UI/UX & Accessibility',
          maxPoints: 20,
          description: 'Responsive design, typography hierarchy, accessibility, and intuitive user workflow without visual clutter.',
        },
        {
          name: 'Architecture & Code Quality',
          maxPoints: 25,
          description: 'Modular code separation, DRY principles, consistent naming, error handling, and clean component state management.',
        },
        {
          name: 'API & Authentication Security',
          maxPoints: 25,
          description: 'RESTful API conventions, JWT token lifecycle, password hashing with salt, and input validation.',
        },
        {
          name: 'Database Modeling & Integrity',
          maxPoints: 20,
          description: 'Mongoose schema schemas, appropriate field indexing, foreign key references, and relational consistency.',
        },
        {
          name: 'Testing & Documentation',
          maxPoints: 10,
          description: 'Comprehensive README setup instructions, API documentation, and test coverage.',
        },
      ],
    });

    // Rubric 2: Cloud & Systems Rubric
    const cloudRubric = await Rubric.create({
      title: 'Cloud & Distributed Systems Rubric',
      description: 'Assessment rubric for scalable backend distributed services, concurrency, caching, and resiliency.',
      createdBy: teacher._id,
      criteria: [
        {
          name: 'System Architecture & Scalability',
          maxPoints: 30,
          description: 'Clean separation of concerns, horizontal scaling capability, and caching strategy.',
        },
        {
          name: 'Fault Tolerance & Error Recovery',
          maxPoints: 30,
          description: 'Graceful degradation, timeout handling, circuit breakers, and database failover readiness.',
        },
        {
          name: 'Performance & Benchmarking',
          maxPoints: 25,
          description: 'P99 latency benchmarks, query optimization, indexing, and resource utilization efficiency.',
        },
        {
          name: 'Observability & Logging',
          maxPoints: 15,
          description: 'Structured logging, healthcheck endpoints, and telemetry instrumentation.',
        },
      ],
    });

    console.log('[Seeder] Creating isolated project evaluations...');

    // Evaluations for Student 1: Alex Johnson
    await ProjectEvaluation.create([
      {
        studentId: studentAlex._id,
        rubricId: webRubric._id,
        projectName: 'DevFlow - Developer Workstation & Task Orchestrator',
        projectDescription: 'A productivity dashboard connecting GitHub pull requests, CI pipelines, and Kanban boards with real-time websocket sync.',
        repositoryUrl: 'https://github.com/alex-johnson/devflow-app',
        scores: [
          {
            criterionName: 'UI/UX & Accessibility',
            pointsAwarded: 19,
            feedback: 'Superb monochromatic dark palette and crisp typography. Keyboard shortcuts work smoothly throughout.',
          },
          {
            criterionName: 'Architecture & Code Quality',
            pointsAwarded: 23,
            feedback: 'Solid modular structure. Custom hooks abstract the API interaction cleanly. Good error boundary implementation.',
          },
          {
            criterionName: 'API & Authentication Security',
            pointsAwarded: 24,
            feedback: 'JWT expiration handled gracefully with auth context refresh. bcrypt salt rounds set correctly.',
          },
          {
            criterionName: 'Database Modeling & Integrity',
            pointsAwarded: 18,
            feedback: 'Mongoose schemas are well indexed. Consider compounding indexes on user tasks for even faster range queries.',
          },
          {
            criterionName: 'Testing & Documentation',
            pointsAwarded: 8,
            feedback: 'Clear README with docker compose file included. Add end-to-end Cypress tests for auth paths.',
          },
        ],
        status: 'Graded',
        totalScore: 92,
        evaluatedBy: teacher._id,
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        studentId: studentAlex._id,
        rubricId: cloudRubric._id,
        projectName: 'KacheKV - Distributed In-Memory Key-Value Store',
        projectDescription: 'LSM-tree backed distributed caching engine with Raft consensus protocol and consistent hashing ring.',
        repositoryUrl: 'https://github.com/alex-johnson/kache-kv',
        status: 'Graded',
        scores: [
          {
            criterionName: 'System Architecture & Scalability',
            pointsAwarded: 27,
            feedback: 'Consistent hashing ring handles node rebalancing with minimal key displacement. Solid Raft leader election.',
          },
          {
            criterionName: 'Fault Tolerance & Error Recovery',
            pointsAwarded: 26,
            feedback: 'WAL (Write-Ahead-Log) replays seamlessly on unannounced node reboot. Heartbeat timeout tuned nicely.',
          },
          {
            criterionName: 'Performance & Benchmarking',
            pointsAwarded: 22,
            feedback: 'P99 read latency under 1.8ms under 50k RPS load. Minor GC pauses noticed during massive bulk writes.',
          },
          {
            criterionName: 'Observability & Logging',
            pointsAwarded: 11,
            feedback: 'Prometheus metrics exported on /metrics. Need more granular error codes for network partition states.',
          },
        ],
        totalScore: 86,
        evaluatedBy: teacher._id,
        submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
    ]);

    // Evaluations for Student 2: Sarah Connor (Completely isolated!)
    await ProjectEvaluation.create([
      {
        studentId: studentSarah._id,
        rubricId: webRubric._id,
        projectName: 'NeuroSync - Collaborative Canvas for Distributed Teams',
        projectDescription: 'Vector-based collaborative whiteboarding application with CRDT conflict resolution and infinite canvas rendering.',
        repositoryUrl: 'https://github.com/sarah-connor/neurosync-canvas',
        status: 'Graded',
        scores: [
          {
            criterionName: 'UI/UX & Accessibility',
            pointsAwarded: 20,
            feedback: 'Flawless minimalist UI inspired by Linear. Zoom and pan gestures are butter smooth at 60fps.',
          },
          {
            criterionName: 'Architecture & Code Quality',
            pointsAwarded: 25,
            feedback: 'Yjs CRDT integration is textbook quality. TypeScript interfaces and state machines are very well designed.',
          },
          {
            criterionName: 'API & Authentication Security',
            pointsAwarded: 24,
            feedback: 'Websocket handshakes verify JWT token before opening peer connections. Robust room-level authorization.',
          },
          {
            criterionName: 'Database Modeling & Integrity',
            pointsAwarded: 19,
            feedback: 'Snapshot document model stores delta logs efficiently without database bloat.',
          },
          {
            criterionName: 'Testing & Documentation',
            pointsAwarded: 8,
            feedback: 'Comprehensive architectural diagrams and ADRs. Excellent documentation.',
          },
        ],
        totalScore: 96,
        evaluatedBy: teacher._id,
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        studentId: studentSarah._id,
        rubricId: cloudRubric._id,
        projectName: 'PulseDB - High-Throughput Time-Series Engine',
        projectDescription: 'Distributed append-only time series engine with memory-mapped chunks, gorilla compression, and downsampling workers.',
        repositoryUrl: 'https://github.com/sarah-connor/pulsedb',
        status: 'Pending',
        scores: [],
        totalScore: 0,
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ]);

    console.log('[Seeder] Database seeded successfully!');
    console.log('[Seeder] Test Accounts:');
    console.log('  Student 1: alex@example.com / password123 (2 projects)');
    console.log('  Student 2: sarah@example.com / password123 (1 project)');
    console.log('  Teacher:   teacher@example.com / password123');
  } catch (err) {
    console.error('[Seeder] Error during seeding:', err);
    throw err;
  }
};

// Auto-seed if database is completely empty on startup
export const seedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Empty database detected. Running automated bootstrap seeder...');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('[Database] Auto-seeding check skipped or encountered error:', err.message);
  }
};

// If run directly via `node seed/seeder.js`
if (process.argv[1]?.endsWith('seeder.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}

