// Simple script to create admin user
const createAdmin = async () => {
  try {
    console.log('Creating admin user...');
    
    const response = await fetch('http://localhost:8080/api/init-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Admin user created successfully!');
      console.log('Email: coinkrazy00@gmail.com');
      console.log('Password: Woot6969!');
      console.log('Role: admin');
    } else {
      console.log('❌ Failed to create admin:', result.error);
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
};

createAdmin();
