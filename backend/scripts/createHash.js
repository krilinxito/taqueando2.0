const bcrypt = require('bcrypt');

async function generateHash() {
  const password = '123456';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash(); 