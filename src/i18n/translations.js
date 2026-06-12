export const translations = {
  th: {
    // ── Navigation ──────────────────────────────────
    nav: {
      home:            'หลัก',
      assessment:      'ประเมิน',
      personalTrainer: 'Personal\nTrainer',
      points:          'แต้ม',
      hello:           'สวัสดี',
      myAccount:       'บัญชีของฉัน',
      logout:          'ออกจากระบบ',
      // Sidebar links
      mainPage:        'หน้าหลัก',
      assessBmi:       'ประเมิน & BMI',
      graphAi:         'กราฟ & คำแนะนำ AI',
      pointsActivity:  'แต้ม & ส่งภาพ',
      knowledge:       'ใบความรู้',
      trainer:         'Personal Trainer',
      survey:          'แบบประเมินความพึงพอใจ',
      schoolDash:      'Dashboard โรงเรียน',
      adminPanel:      'Admin Panel',
    },

    // ── Dashboard ────────────────────────────────────
    dashboard: {
      homeTab:         'หน้าหลัก',
      profileTab:      'บัญชีของฉัน',
      healthScore:     'คะแนน',
      healthToday:     'สุขภาพวันนี้',
      streak:          'Streak',
      days:            'วัน',
      pts:             'แต้ม',
      noData:          'ยังไม่มีข้อมูล',
      noDataSub:       'เริ่มประเมินสุขภาพเพื่อดูคะแนนของคุณ',
      assessAgain:     'ประเมินสุขภาพอีกครั้ง',
      startNow:        'เริ่มประเมินเดี๋ยวนี้!',
      quickMenu:       'เมนูด่วน',
      latestData:      'ข้อมูลล่าสุด',
      weeklyTrend:     'แนวโน้มสุขภาพ 7 วัน',
      trackProgress:   'ติดตามความก้าวหน้าของคุณ',
      seeMore:         'ดูเพิ่ม',
      tipTitle:        'เคล็ดลับสุขภาพวันนี้',
      greet:           'สวัสดี',
      bmiLabel:        'BMI',
    },

    // ── Quick Actions ─────────────────────────────────
    quick: {
      assessment: 'ประเมิน\nสุขภาพ',
      bmi:        'คำนวณ\nBMI',
      calories:   'บันทึก\nแคลอรี่',
      graph:      'กราฟ\nสุขภาพ',
      ai:         'แนะนำ\nAI',
      knowledge:  'ใบ\nความรู้',
    },

    // ── Stat cards ────────────────────────────────────
    stats: {
      sleep:    'นอนหลับ',
      screen:   'หน้าจอ',
      stress:   'ความเครียด',
      exercise: 'ออกกำลัง',
      water:    'ดื่มน้ำ',
    },

    // ── Units ─────────────────────────────────────────
    units: {
      hrs:       'ชม.',
      daysPerWk: 'วัน/สปด.',
      glasses:   'แก้ว',
      outOf10:   '/10',
    },

    // ── Tips ──────────────────────────────────────────
    tips: [
      'ดื่มน้ำอุ่นหลังตื่นนอนช่วยกระตุ้นระบบเผาผลาญและเตรียมร่างกายให้พร้อมสำหรับวัน',
      'นอนหลับให้ครบ 8 ชั่วโมง ช่วยให้ความจำดีขึ้นและลดความเครียดได้จริง',
      'ออกกำลังกาย 30 นาทีต่อวัน ช่วยเพิ่ม endorphin ทำให้อารมณ์ดีขึ้น',
      'กินผักผลไม้หลากสีสัน = ได้สารอาหารครบถ้วนทุกประเภท',
    ],

    // ── Assessment ────────────────────────────────────
    assessment: {
      title:       'ประเมินสุขภาพ',
      subtitle:    'ตอบคำถามสุขภาพวันนี้',
      submit:      'บันทึกผล',
      back:        'ย้อนกลับ',
      next:        'ถัดไป',
      score:       'คะแนนสุขภาพ',
      great:       'ยอดเยี่ยม',
      good:        'ดี',
      fair:        'พอใช้',
      poor:        'ต้องปรับปรุง',
    },

    // ── BMI ───────────────────────────────────────────
    bmi: {
      title:       'คำนวณ BMI',
      weight:      'น้ำหนัก (กก.)',
      height:      'ส่วนสูง (ซม.)',
      calculate:   'คำนวณ',
      result:      'ผลลัพธ์',
      underweight: 'น้ำหนักน้อย',
      normal:      'ปกติ',
      overweight:  'น้ำหนักเกิน',
      obese:       'อ้วน',
    },

    // ── NubCal / Personal Trainer ─────────────────────
    trainer: {
      title:       'ไดอารี่',
      today:       'วันนี้',
      addFood:     'บันทึกอาหาร',
      addWater:    'บันทึกการดื่มน้ำ',
      breakfast:   'อาหารเช้า',
      lunch:       'อาหารกลางวัน',
      dinner:      'อาหารเย็น',
      snack:       'อาหารว่าง',
      water:       'น้ำ',
      calories:    'แคลอรี',
      ml:          'มล.',
      summary:     'สรุป',
      energy:      'พลังงาน',
      carb:        'คาร์บ',
      protein:     'โปรตีน',
      fat:         'ไขมัน',
      analyze:     'วิเคราะห์สารอาหาร',
      analyzing:   'กำลังวิเคราะห์...',
      searchFood:  'ค้นหาอาหาร',
      manualEntry: 'บันทึกเอง',
      saveRecord:  'บันทึกลงประวัติ',
      cancel:      'ยกเลิก',
      settings:    'ตั้งค่าพลังงานต่อวัน',
      goalAuto:    '🤖 อัตโนมัติ',
      goalManual:  '✏️ กำหนดเอง',
      save:        'บันทึก',
      remaining:   'ที่ควรได้รับ',
      shotPhoto:   'ถ่ายรูป / เลือกภาพ',
      aiAnalyze:   'วิเคราะห์โภชนาการด้วย AI',
      fromDB:      'ค้นหาจากฐานข้อมูล',
      thaiFood:    'อาหารไทย',
      items:       'รายการ',
    },

    // ── Rewards ───────────────────────────────────────
    rewards: {
      title:     'แต้มสะสม',
      myPoints:  'แต้มของฉัน',
      redeem:    'แลกของรางวัล',
      history:   'ประวัติ',
      pts:       'แต้ม',
      sendPhoto: 'ส่งภาพกิจกรรม',
    },

    // ── Common ────────────────────────────────────────
    common: {
      loading:  'กำลังโหลด...',
      error:    'เกิดข้อผิดพลาด',
      retry:    'ลองใหม่',
      save:     'บันทึก',
      cancel:   'ยกเลิก',
      delete:   'ลบ',
      confirm:  'ยืนยัน',
      close:    'ปิด',
      edit:     'แก้ไข',
      search:   'ค้นหา',
      noData:   'ไม่มีข้อมูล',
      all:      'ทั้งหมด',
    },
  },

  // ══════════════════════════════════════════════════════
  en: {
    // ── Navigation ──────────────────────────────────
    nav: {
      home:            'Home',
      assessment:      'Assess',
      personalTrainer: 'Personal\nTrainer',
      points:          'Points',
      hello:           'Hello',
      myAccount:       'My Account',
      logout:          'Log Out',
      mainPage:        'Home',
      assessBmi:       'Assessment & BMI',
      graphAi:         'Graph & AI Tips',
      pointsActivity:  'Points & Photos',
      knowledge:       'Knowledge',
      trainer:         'Personal Trainer',
      survey:          'Satisfaction Survey',
      schoolDash:      'School Dashboard',
      adminPanel:      'Admin Panel',
    },

    // ── Dashboard ────────────────────────────────────
    dashboard: {
      homeTab:         'Home',
      profileTab:      'My Account',
      healthScore:     'Health',
      healthToday:     'Score Today',
      streak:          'Streak',
      days:            'days',
      pts:             'pts',
      noData:          'No Data Yet',
      noDataSub:       'Start your health assessment to see your score',
      assessAgain:     'Re-assess Health',
      startNow:        'Start Now!',
      quickMenu:       'Quick Menu',
      latestData:      'Latest Data',
      weeklyTrend:     '7-Day Health Trend',
      trackProgress:   'Track your progress',
      seeMore:         'See More',
      tipTitle:        "Today's Health Tip",
      greet:           'Hello',
      bmiLabel:        'BMI',
    },

    // ── Quick Actions ─────────────────────────────────
    quick: {
      assessment: 'Health\nAssessment',
      bmi:        'BMI\nCalculator',
      calories:   'Calorie\nTracker',
      graph:      'Health\nGraph',
      ai:         'AI\nAdvice',
      knowledge:  'Knowledge\nBase',
    },

    // ── Stat cards ────────────────────────────────────
    stats: {
      sleep:    'Sleep',
      screen:   'Screen',
      stress:   'Stress',
      exercise: 'Exercise',
      water:    'Water',
    },

    // ── Units ─────────────────────────────────────────
    units: {
      hrs:       'hrs',
      daysPerWk: 'days/wk',
      glasses:   'glasses',
      outOf10:   '/10',
    },

    // ── Tips ──────────────────────────────────────────
    tips: [
      'Drinking warm water after waking up boosts metabolism and prepares your body for the day.',
      'Getting a full 8 hours of sleep genuinely improves memory and reduces stress.',
      'Just 30 minutes of exercise per day increases endorphins and lifts your mood.',
      'Eating colorful fruits and vegetables ensures you get a full range of nutrients.',
    ],

    // ── Assessment ────────────────────────────────────
    assessment: {
      title:       'Health Assessment',
      subtitle:    "Answer today's health questions",
      submit:      'Save Results',
      back:        'Back',
      next:        'Next',
      score:       'Health Score',
      great:       'Excellent',
      good:        'Good',
      fair:        'Fair',
      poor:        'Needs Improvement',
    },

    // ── BMI ───────────────────────────────────────────
    bmi: {
      title:       'BMI Calculator',
      weight:      'Weight (kg)',
      height:      'Height (cm)',
      calculate:   'Calculate',
      result:      'Result',
      underweight: 'Underweight',
      normal:      'Normal',
      overweight:  'Overweight',
      obese:       'Obese',
    },

    // ── NubCal / Personal Trainer ─────────────────────
    trainer: {
      title:       'Food Diary',
      today:       'Today',
      addFood:     'Log Food',
      addWater:    'Log Water',
      breakfast:   'Breakfast',
      lunch:       'Lunch',
      dinner:      'Dinner',
      snack:       'Snack',
      water:       'Water',
      calories:    'Calories',
      ml:          'ml',
      summary:     'Summary',
      energy:      'Energy',
      carb:        'Carbs',
      protein:     'Protein',
      fat:         'Fat',
      analyze:     'Analyze Nutrition',
      analyzing:   'Analyzing...',
      searchFood:  'Search Food',
      manualEntry: 'Enter Manually',
      saveRecord:  'Save to History',
      cancel:      'Cancel',
      settings:    'Daily Calorie Goal',
      goalAuto:    '🤖 Auto',
      goalManual:  '✏️ Manual',
      save:        'Save',
      remaining:   'Remaining',
      shotPhoto:   'Take / Choose Photo',
      aiAnalyze:   'AI Nutrition Analysis',
      fromDB:      'Search Database',
      thaiFood:    'Thai Food',
      items:       'items',
    },

    // ── Rewards ───────────────────────────────────────
    rewards: {
      title:     'Points & Rewards',
      myPoints:  'My Points',
      redeem:    'Redeem Reward',
      history:   'History',
      pts:       'pts',
      sendPhoto: 'Submit Activity Photo',
    },

    // ── Common ────────────────────────────────────────
    common: {
      loading:  'Loading...',
      error:    'An error occurred',
      retry:    'Retry',
      save:     'Save',
      cancel:   'Cancel',
      delete:   'Delete',
      confirm:  'Confirm',
      close:    'Close',
      edit:     'Edit',
      search:   'Search',
      noData:   'No data available',
      all:      'All',
    },
  },
}
