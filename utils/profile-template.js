(function initProfileTemplate(global) {
  const MARKDOWN_TEMPLATE = `# Personal Profile Template

## 📋 Basic Information

\`\`\`yaml
# 基本信息
personal:
  # 姓名相关
  name:
    full_name_en: ""  # 英文全名
    full_name_cn: ""  # 中文全名
    family_name_en: ""    # 英文姓
    given_name_en: ""       # 英文名
    family_name_cn: ""       # 中文姓
    given_name_cn: ""        # 中文名
    preferred_name: ""      # 常用名/昵称 (optional)
    name_in_passport: ""       # 护照姓名 (如果不同)
  
  # 性别与称谓
  gender: ""             # Male/Female/Non-binary/Prefer not to say
  title: ""                 # Mr./Ms./Mrs./Dr./Prof.
  pronouns: ""          # (optional)
  
  # 出生信息
  date_of_birth: ""  # YYYY-MM-DD
  place_of_birth:
    city: ""
    province: ""
    country: ""
  
  # 国籍与身份
  nationality: ""
  citizenship: []       # 可以多个
  residency_status: 
    current_country: ""
    visa_type: ""           # 学生签/工作签等
    permanent_resident_of: []  # 永居国家列表
  
  # 语言能力
  languages:
    - language: ""
      proficiency: ""
      can_read: true
      can_write: true
      can_speak: true
  
  # 身份识别
  identification:
    national_id: ""            # 身份证号 (敏感信息，可选填)
    passport_number: ""        # 护照号
    passport_expiry: ""        # 护照有效期
    drivers_license: ""        # 驾照 (如需要)
\`\`\`

---

## 🎓 Education

\`\`\`yaml
education:
  - institution:
      # 学校信息 - 多语言多格式
      name_en: ""
      name_cn: ""
      name_abbr: []
      name_official: ""        # 官方注册名称（如果不同）
      
      # 学校层级
      type: ""       # University/College/Institute
      ranking:
        qs_world: ""           # QS排名 (optional)
        national: ""           # 国内排名 (optional)
      
      # 位置信息
      location:
        campus: ""  # 校区名称
        address: ""
        city: ""
        province: ""
        postal_code: ""
        country: ""
        country_code: ""
    
    # 院系专业 - 多层级
    academic_unit:
      college_en: ""
      college_cn: ""
      department_en: ""        # 系 (如果有)
      department_cn: ""
      major_en: ""
      major_cn: ""
      major_code: ""           # 专业代码 (optional)
      concentration: []        # 专业方向/concentration (optional)
      minor: []               # 辅修 (optional)
    
    # 学位信息
    degree:
      level: ""   # Undergraduate/Graduate/Doctoral
      type: ""  # Bachelor of Science/Arts/Engineering等
      expected_degree: ""  # 预期学位
      honors: ""              # With Honors/Distinction等 (optional)
    
    # 时间与状态
    timeline:
      start_date: ""    # YYYY-MM
      end_date: ""      # YYYY-MM (或expected)
      expected_graduation: ""
      status: ""        # Current/Completed/On Leave/Withdrawn
      study_mode: ""  # Full-time/Part-time/Distance
    
    # 学业表现
    academic_performance:
      gpa:
        value: ""
        scale: ""
        calculation_method: ""  # Weighted/Unweighted
      gpa_major: ""         # 专业GPA (optional)
      ranking:
        value: ""        # 排名
        percentile: ""  # 百分比
      total_credits: ""
      credits_completed: ""
      
    # 课程信息 (optional, 可详细列出)
    relevant_coursework: []
    
    # 荣誉奖项 (在校期间)
    honors_and_awards: []
    
    # 论文与出版物 (本科期间)
    publications: []
    
    # 课外活动 (校内)
    extracurricular: []
\`\`\`

---

## 💼 Work Experience

\`\`\`yaml
experience:
  - company:
      # 公司信息
      name_en: ""
      name_cn: ""
      name_legal: ""           # 法律注册名称
      industry: ""
      company_type: ""  # Public/Private/Startup/NGO等
      size: ""        # 员工规模
      website: ""
      
      # 位置
      location:
        office: ""
        city: ""
        country: ""
        remote: false          # 是否远程
    
    # 职位信息
    position:
      title_en: ""
      title_cn: ""
      level: ""          # Intern/Junior/Mid/Senior/Lead/Manager
      department: ""
      employment_type: ""  # Full-time/Part-time/Internship/Contract
      
    # 时间
    timeline:
      start_date: ""
      end_date: ""             # 空表示current
      current: false
      duration: ""
    
    # 工作内容
    responsibilities: []
    
    # 成就与影响
    achievements: []
    
    # 技术栈
    technologies: []
    
    # 汇报关系
    reporting:
      supervisor: ""
      team_size: ""
    
    # 薪资 (optional, 可不填)
    compensation:
      salary: ""
      currency: ""
\`\`\`

---

## 🚀 Projects

\`\`\`yaml
projects:
  - project:
      # 项目基本信息
      name: ""
      subtitle: ""
      category: ""     # Research/Personal/Academic/Commercial
      status: ""      # Ongoing/Completed/On Hold
      
      # 时间与规模
      timeline:
        start_date: ""
        end_date: ""
        duration: ""
      
      team:
        size: ""
        your_role: ""
        collaboration: ""  # Solo/Academic/Industry
      
      # 项目描述
      description:
        short: ""
        detailed: ""
      
      # 你的贡献
      your_contributions: []
      
      # 技术细节
      technical:
        tech_stack: []
        methodologies: []
        architecture: ""
      
      # 成果与影响
      outcomes:
        metrics: []
        deliverables: []
      
      # 关键词/标签
      tags: []
      
      # 链接
      links:
        github: ""
        demo: ""
        paper: ""
        video: ""
\`\`\`

---

## 🏆 Honors & Awards

\`\`\`yaml
awards:
  - award:
      name_en: ""
      name_cn: ""
      
      issuer:
        organization: ""
        organization_cn: ""
        country: ""
      
      date: ""
      
      level: ""        # School/City/Provincial/National/International
      
      category: ""     # Academic/Research/Competition/Service/Leadership
      
      description: ""
      
      value: ""        # 奖金金额 (optional)
      
      selection_criteria: ""
      team: false
      team_size: ""
\`\`\`

---

## 📚 Publications & Research

\`\`\`yaml
publications:
  - publication:
      type: ""   # Journal/Conference/Workshop/Working Paper/Thesis
      title: ""
      authors: []
      venue:
        name: ""
        type: ""
        year: ""
        month: ""
      identifiers:
        doi: ""
        arxiv: ""
        ssrn: ""
        url: ""
      status: ""      # Published/Submitted/In Review/In Preparation
      abstract: ""
      keywords: []
      submission_date: ""
\`\`\`

---

## 💡 Skills

\`\`\`yaml
skills:
  # 技术技能
  technical_skills:
    programming_languages: []
    frameworks_and_libraries: []
    tools_and_platforms: []
    domains: []
  
  # 软技能
  soft_skills: []
  
  # 专业认证 (optional)
  certifications: []
\`\`\`

---

## 🌐 Online Presence

\`\`\`yaml
online_presence:
  # 学术与专业
  academic:
    google_scholar: ""
    orcid: ""
    researchgate: ""
    semantic_scholar: ""
  
  # 代码与开源
  code:
    github: ""
    gitlab: ""
    bitbucket: ""
  
  # 职业网络
  professional:
    linkedin: ""
    indeed: ""
    glassdoor: ""
  
  # 个人网站
  personal:
    portfolio: ""
    blog: ""
    
  # 社交媒体 (optional)
  social:
    twitter: ""
    xiaohongshu: ""
\`\`\`

---

## 📞 Contact Information

\`\`\`yaml
contact:
  # 电话
  phone:
    primary: ""
    country_code: ""
    can_call: true
    can_text: true
    whatsapp: false
  
  # 邮箱
  email:
    primary: ""
    secondary: ""
    academic: ""
  
  # 地址
  address:
    current:
      type: ""         # Home/School/Work/Temporary
      address_line1: ""
      address_line2: ""
      city: ""
      province: ""
      postal_code: ""
      country: ""
    
    permanent:
      type: ""
      city: ""
      province: ""
      country: ""
  
  # 紧急联系人 (optional)
  emergency_contact:
    name: ""
    relationship: ""
    phone: ""
\`\`\`

---

## 🎯 Career Objectives

\`\`\`yaml
career:
  # 当前求职目标
  current_goal:
    position_type: ""  # Internship/Full-time/Graduate Student
    target_roles: []
    target_industries: []
    target_locations: []
    preferences:
      start_date: ""
      willing_to_relocate: false
      work_authorization: ""
  
  # 长期目标
  long_term:
    aspiration: ""
    timeline: ""
  
  # 研究兴趣
  research_interests: []
\`\`\`

---

## 🔒 Privacy & Preferences

\`\`\`yaml
preferences:
  # 隐私设置
  privacy:
    share_phone: "employers_only"      # public/employers_only/never
    share_address: "general_only"      # full/general_only/never
    share_salary_history: false
  
  # 求职偏好
  job_search:
    open_to_opportunities: true
    remote_work: "hybrid"              # yes/no/hybrid/flexible
    willing_to_travel: "occasionally"  # frequently/occasionally/rarely/never
    overtime: "flexible"               # yes/no/flexible
  
  # 多样性信息 (optional, 自愿填写)
  diversity:
    veteran: false
    disability: false
    lgbtq: false
\`\`\`

---

## 📎 Supporting Documents

\`\`\`yaml
documents:
  # 学历证明
  academic: []
  
  # 语言成绩
  language: []
  
  # 推荐信
  recommendations: []
  
  # 其他
  other: []
\`\`\``;

  global.ResumeProfileTemplate = {
    MARKDOWN_TEMPLATE
  };
})(globalThis);
