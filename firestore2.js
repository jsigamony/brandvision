//this file gets the branding data from the brand collection in firestore and returns it to the caller

const admin = require('firebase-admin');
const { initializeFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with your service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // projectId: 'your-project-id',
});

// Initialize Firestore with a specific databaseId
const db = initializeFirestore(admin.app(), {});

// Brand class to structure the data
class Brand {
  constructor(data) {
    this.accentColor = data.accentColor || '';
    this.bodyFont = data.bodyFont || '';
    this.brandId = data.brandId || '';
    this.brandVisionToggler = data.brandVisionToggler || false;
    this.captionToggler = data.captionToggler || false;
    this.colors = data.colors || '';
    this.ctaLink = data.ctaLink || '';
    this.ctaName = data.ctaName || '';
    this.logo = data.logo || '';
    this.logoToggler = data.logoToggler || false;
    this.name = data.name || '';
    this.primaryColor = data.primaryColor || '';
    this.secondaryColor = data.secondaryColor || '';
    this.target = data.target || '';
    this.theme = data.theme || '';
    this.titleFont = data.titleFont || '';
    this.tone = data.tone || '';
  }
}

//Main function
async function fetchBrandInfo(brandId = '151116friday') {
  try {
    const brandRef = db.collection('brands').doc(brandId); //getting the brand collection with specified brandId
    const doc = await brandRef.get();

    if (!doc.exists) {
      console.log('No brand found with this ID');
      return null;
    }

    // Create a Brand object with the document data
    const brandData = new Brand(doc.data());
    return brandData;

  } catch (error) {
    console.error('Error retrieving brand:', error);
    return null;
  }
}

// Example usage function
// async function example() {
//   const brand = await fetchBrandInfo('1511friday'); //this function passes back the brand object that is created inside the function
//   if (brand) {
//     // Now you can access properties directly
//     console.log('Brand Tone:', brand.tone);
//     console.log('Accent Color:', brand.accentColor);
//     console.log('Target:', brand.target);
//     console.log('Theme:', brand.theme);
    
//     // You can also destructure specific properties you need
//     const { tone, accentColor, primaryColor, theme } = brand;
//     console.log({ tone, accentColor, primaryColor, theme });
//   }
// }


async function getBrandInfo(brandID="anam12") {
    const brand = await fetchBrandInfo(brandID); //this function passes back the brand object that is created inside the function
    
    // console.log(brand); //printing out the brand object
    
    return brand;

}

module.exports = { 
  fetchBrandInfo,
  Brand,
  getBrandInfo
};

// Uncomment to run example
// example();
getBrandInfo();
