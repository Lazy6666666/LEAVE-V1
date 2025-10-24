const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test users data
const testUsers = [
  {
    email: 'employee@test.com',
    password: 'Test123456!',
    fullName: 'Test Employee',
    role: 'EMPLOYEE',
    department: 'Engineering'
  },
  {
    email: 'manager@test.com',
    password: 'Test123456!',
    fullName: 'Test Manager',
    role: 'MANAGER',
    department: 'Engineering'
  },
  {
    email: 'hr@test.com',
    password: 'Test123456!',
    fullName: 'Test HR',
    role: 'HR',
    department: 'Human Resources'
  },
  {
    email: 'admin@test.com',
    password: 'Test123456!',
    fullName: 'Test Admin',
    role: 'ADMIN',
    department: 'IT'
  }
];

async function createTestUsers() {
  console.log('🔧 Creating test users...\n');

  for (const user of testUsers) {
    try {
      // 1. Create user in auth
      console.log(`Creating user: ${user.email} (${user.role})`);

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ⚠️  User ${user.email} already exists, skipping creation`);
          continue;
        } else {
          throw authError;
        }
      }

      // 2. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: authData.user.id,
          full_name: user.fullName,
          role: user.role,
          department: user.department,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`  ❌ Error creating profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`  ✅ Created user and profile: ${user.email}`);
      }

    } catch (error) {
      console.error(`  ❌ Error creating user ${user.email}:`, error.message);
    }
  }

  console.log('\n✨ Test user setup complete!');
  console.log('\n📋 Test Users:');
  testUsers.forEach(user => {
    console.log(`  • ${user.email} (${user.role}) - Password: ${user.password}`);
  });
}

async function createLeaveTypes() {
  console.log('\n🔧 Creating leave types...');

  const leaveTypes = [
    { name: 'Annual Leave', days_per_year: 21, requires_approval: true, paid: true },
    { name: 'Sick Leave', days_per_year: 10, requires_approval: true, paid: true },
    { name: 'Personal Leave', days_per_year: 5, requires_approval: true, paid: false },
    { name: 'Maternity Leave', days_per_year: 90, requires_approval: true, paid: true },
    { name: 'Paternity Leave', days_per_year: 14, requires_approval: true, paid: true }
  ];

  for (const leaveType of leaveTypes) {
    try {
      const { error } = await supabase
        .from('leave_types')
        .upsert({
          ...leaveType,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'name'
        });

      if (error) {
        console.error(`  ❌ Error creating leave type ${leaveType.name}:`, error.message);
      } else {
        console.log(`  ✅ Created leave type: ${leaveType.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Error creating leave type ${leaveType.name}:`, error.message);
    }
  }

  console.log('✨ Leave types setup complete!');
}

async function main() {
  try {
    await createTestUsers();
    await createLeaveTypes();
    console.log('\n🎉 Setup complete! You can now log in with the test users.');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();