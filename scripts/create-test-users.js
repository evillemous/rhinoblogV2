// Script to create test users with different roles
import { storage } from '../server/storage.ts';

async function createTestUsers() {
  try {
    console.log('Creating test users with different roles...');
    
    // Create superadmin user
    const superadmin = await storage.createUser({
      username: 'superadmin',
      password: 'super123',
      role: 'superadmin',
      email: 'superadmin@example.com',
      isAdmin: true, // For backward compatibility
      trustScore: 100,
      verified: true
    });
    console.log(`Created superadmin user: ${superadmin.username}, ID: ${superadmin.id}`);
    
    // Create admin user
    const admin = await storage.createUser({
      username: 'admin',
      password: 'rhinoadmin123',
      role: 'admin',
      email: 'admin@example.com',
      isAdmin: true, // For backward compatibility
      trustScore: 80,
      verified: true
    });
    console.log(`Created admin user: ${admin.username}, ID: ${admin.id}`);
    
    // Create contributor (surgeon) user
    const surgeonContributor = await storage.createUser({
      username: 'drsurgeon',
      password: 'surgeon123',
      role: 'contributor',
      contributorType: 'surgeon',
      email: 'surgeon@example.com',
      bio: 'Board-certified rhinoplasty specialist with 15 years of experience.',
      trustScore: 95,
      verified: true
    });
    console.log(`Created surgeon contributor: ${surgeonContributor.username}, ID: ${surgeonContributor.id}`);
    
    // Create contributor (patient) user
    const patientContributor = await storage.createUser({
      username: 'patient',
      password: 'patient123',
      role: 'contributor',
      contributorType: 'patient',
      email: 'patient@example.com',
      bio: 'Had rhinoplasty in 2022, sharing my experience and recovery journey.',
      trustScore: 70,
      verified: true
    });
    console.log(`Created patient contributor: ${patientContributor.username}, ID: ${patientContributor.id}`);
    
    // Create contributor (influencer) user
    const influencerContributor = await storage.createUser({
      username: 'influencer',
      password: 'influencer123',
      role: 'contributor',
      contributorType: 'influencer',
      email: 'influencer@example.com',
      bio: 'Beauty influencer with 500K followers, sharing my rhinoplasty transformation.',
      trustScore: 85,
      verified: true
    });
    console.log(`Created influencer contributor: ${influencerContributor.username}, ID: ${influencerContributor.id}`);
    
    // Create contributor (blogger) user
    const bloggerContributor = await storage.createUser({
      username: 'blogger',
      password: 'blogger123',
      role: 'contributor',
      contributorType: 'blogger',
      email: 'blogger@example.com',
      bio: 'Medical writer specializing in cosmetic procedures and patient experiences.',
      trustScore: 75,
      verified: true
    });
    console.log(`Created blogger contributor: ${bloggerContributor.username}, ID: ${bloggerContributor.id}`);
    
    // Create regular user
    const regularUser = await storage.createUser({
      username: 'user',
      password: 'user123',
      role: 'user',
      email: 'user@example.com',
      trustScore: 30,
      verified: true
    });
    console.log(`Created regular user: ${regularUser.username}, ID: ${regularUser.id}`);
    
    console.log('Test users created successfully!');
    console.log('\nYou can use the following credentials to test the system:');
    console.log('Superadmin: username=superadmin, password=super123');
    console.log('Admin: username=admin, password=rhinoadmin123');
    console.log('Surgeon Contributor: username=drsurgeon, password=surgeon123');
    console.log('Patient Contributor: username=patient, password=patient123');
    console.log('Influencer Contributor: username=influencer, password=influencer123');
    console.log('Blogger Contributor: username=blogger, password=blogger123');
    console.log('Regular User: username=user, password=user123');
    
  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

createTestUsers();