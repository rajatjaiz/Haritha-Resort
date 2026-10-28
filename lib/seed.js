// Default settings and sample menu. The sample menu is PLACEHOLDER data until the real menu is imported.
const DEFAULTS = {
  resort_name: 'Haritha Beach Resort',
  location: 'Suryalanka Beach, Bapatla, Andhra Pradesh',
  tagline: 'APTDC · Andhra Pradesh Tourism',
  wifi_name: 'Haritha_Guest', wifi_password: 'ChangeMe123',
  reception_phone: '', checkin_time: '12:00', checkout_time: '11:00',
  restaurant_hours: '07:30 - 22:30', gst_percent: '5', gstin: '',
  upi_id: '', upi_name: 'Haritha Beach Resort', accept_cash: '1',
  guidelines: 'Quiet hours 10 PM - 6 AM.\nNo outside food or alcohol in the rooms.\nBeach swimming only in the marked safe zone; no lifeguard after dusk.\nPlease keep valuables in the room safe.\nSwitch off AC and lights when leaving the room.\nCheck-out time is 11:00 AM.',
  nearby: JSON.stringify([
    { name: 'Suryalanka Beach', note: 'Right in front of the resort', dist: '0 km' },
    { name: 'Bapatla', note: 'Town, ATM, pharmacy, hospital', dist: '~9 km' },
    { name: 'Chirala', note: 'Railway station, market', dist: '~40 km' },
    { name: 'Guntur', note: 'Major city, airport access via Vijayawada', dist: '~75 km' },
    { name: 'Bhavannarayana Swamy Temple, Bapatla', note: 'Ancient temple', dist: '~9 km' }
  ]),
  helplines: JSON.stringify([
    { name: 'Police', number: '100' }, { name: 'Ambulance', number: '108' },
    { name: 'Fire', number: '101' }, { name: 'Women helpline', number: '181' },
    { name: 'Tourist helpline', number: '1363' }
  ])
};

// [kind, category, name, name_hi, name_ml, description, price, veg]
const SAMPLE_MENU = [
  ['food', 'Breakfast', 'Idli (3 pcs)', 'इडली', 'ഇഡ്ഡലി', 'With sambar and chutneys', 60, 1],
  ['food', 'Breakfast', 'Plain Dosa', 'सादा डोसा', 'ദോശ', 'Crisp, with sambar and chutneys', 70, 1],
  ['food', 'Breakfast', 'Puri Bhaji (2 pcs)', 'पूरी भाजी', 'പൂരി ഭാജി', '', 70, 1],
  ['food', 'Veg Starters', 'Gobi Manchurian', 'गोबी मंचूरियन', 'ഗോബി മഞ്ചൂരിയൻ', '', 150, 1],
  ['food', 'Veg Main Course', 'Paneer Butter Masala', 'पनीर बटर मसाला', 'പനീർ ബട്ടർ മസാല', '', 210, 1],
  ['food', 'Veg Main Course', 'Veg Curry (Mixed)', 'मिक्स वेज करी', 'വെജ് കറി', '', 160, 1],
  ['food', 'Non-Veg Starters', 'Chicken 65', 'चिकन 65', 'ചിക്കൻ 65', '', 220, 0],
  ['food', 'Non-Veg Starters', 'Apollo Fish', 'अपोलो फिश', 'അപ്പോളോ ഫിഷ്', 'Andhra-style fried fish', 260, 0],
  ['food', 'Non-Veg Main Course', 'Andhra Chicken Curry', 'आंध्र चिकन करी', 'ആന്ധ്ര ചിക്കൻ കറി', 'Spicy, with bone', 250, 0],
  ['food', 'Non-Veg Main Course', 'Fish Curry', 'फिश करी', 'മീൻ കറി', 'Fresh catch, coastal style', 280, 0],
  ['food', 'Non-Veg Main Course', 'Prawns Masala', 'प्रॉन मसाला', 'ചെമ്മീൻ മസാല', '', 320, 0],
  ['food', 'Rice & Biryani', 'Veg Fried Rice', 'वेज फ्राइड राइस', 'വെജ് ഫ്രൈഡ് റൈസ്', '', 150, 1],
  ['food', 'Rice & Biryani', 'Chicken Dum Biryani', 'चिकन बिरयानी', 'ചിക്കൻ ബിരിയാണി', 'Served with raita', 260, 0],
  ['food', 'Rice & Biryani', 'Curd Rice', 'दही चावल', 'തൈര് സാദം', '', 80, 1],
  ['food', 'Breads', 'Butter Naan', 'बटर नान', 'ബട്ടർ നാൻ', '', 45, 1],
  ['food', 'Breads', 'Chapati (2 pcs)', 'चपाती', 'ചപ്പാത്തി', '', 40, 1],
  ['food', 'Beverages', 'Tea', 'चाय', 'ചായ', '', 20, 1],
  ['food', 'Beverages', 'Filter Coffee', 'फिल्टर कॉफी', 'കാപ്പി', '', 30, 1],
  ['food', 'Beverages', 'Fresh Lime Soda', 'लाइम सोडा', 'ലൈം സോഡ', '', 60, 1],
  ['food', 'Beverages', 'Tender Coconut', 'नारियल पानी', 'ഇളനീർ', '', 60, 1],
  ['food', 'Desserts', 'Ice Cream (Scoop)', 'आइसक्रीम', 'ഐസ്ക്രീം', '', 60, 1],
  ['bar', 'Beer', 'Beer (650 ml)', 'बीयर', 'ബിയർ', 'Price as per state MRP', 0, 1],
  ['bar', 'Whisky / Rum / Vodka', 'Spirits (60 ml)', 'स्पिरिट्स', 'സ്പിരിറ്റ്സ്', 'Ask at the bar counter', 0, 1]
];

module.exports = { DEFAULTS, SAMPLE_MENU };
