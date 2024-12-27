import { FormData } from '@/types/form';

interface IndustryTemplate {
  industry: string;
  icon: string;
  targetAudience: string;
  audienceDescription: string;
  newsletterObjectives: string;
  primaryCTA: string;
}

// Note: These templates provide general examples. Users should customize them with their specific company details.
const industryTemplates: { [key: string]: Partial<FormData> & IndustryTemplate } = {
  technology: {
    industry: "Technology & Software",
    icon: "💻",
    targetAudience: 'Tech-savvy professionals, IT decision-makers, and business leaders',
    audienceDescription: 'Our target audience consists of professionals who value innovative solutions. They are typically aged 25-55, working in technology-related roles or making technology decisions for their organizations. [Customize with your specific target demographics and behaviors]',
    newsletterObjectives: 'Share industry insights, product updates, and tech trends. Establish thought leadership in the tech space. [Add your specific company goals and unique value propositions]',
    primaryCTA: 'Explore our latest solutions or schedule a demo. [Customize with your specific product/service offering]'
  },
  healthcare: {
    industry: "Healthcare & Medical",
    icon: "🏥",
    targetAudience: 'Healthcare professionals, medical administrators, and wellness enthusiasts',
    audienceDescription: 'Our audience includes medical practitioners, healthcare administrators, and individuals interested in health and wellness. They value evidence-based information and professional development. [Add your specific target audience characteristics]',
    newsletterObjectives: 'Provide updates on medical innovations, industry best practices, and healthcare insights. [Customize with your organization\'s specific goals and expertise]',
    primaryCTA: 'Book a consultation or learn more about our services. [Modify based on your specific healthcare offerings]'
  },
  education: {
    industry: "Education & E-learning",
    icon: "📚",
    targetAudience: 'Educators, school administrators, and education technology professionals',
    audienceDescription: 'We serve education professionals seeking innovative teaching methods and administrative solutions. This includes K-12 teachers, university faculty, and EdTech decision-makers. [Specify your target education segment and their needs]',
    newsletterObjectives: 'Share educational resources, industry updates, and teaching strategies. [Add your institution\'s specific objectives and unique educational approach]',
    primaryCTA: 'Discover our educational resources or sign up for a workshop. [Customize based on your specific educational offerings]'
  },
  retail: {
    industry: "Retail & E-commerce",
    icon: "🛍️",
    targetAudience: 'Retail business owners, store managers, and retail industry professionals',
    audienceDescription: 'Our audience includes retail decision-makers looking to optimize their operations and stay competitive. They are interested in retail trends, technology, and customer experience. [Add your specific retail segment focus]',
    newsletterObjectives: 'Provide retail industry insights, trend analysis, and business strategies. [Include your company\'s specific retail expertise and value proposition]',
    primaryCTA: 'Explore our retail solutions or request a consultation. [Modify based on your specific retail products/services]'
  },
  finance: {
    industry: "Finance & Banking",
    icon: "💰",
    targetAudience: 'Financial professionals, investors, and business decision-makers',
    audienceDescription: 'We target finance industry professionals seeking market insights and financial solutions. This includes investment managers, financial advisors, and corporate finance leaders. [Customize with your specific financial sector focus]',
    newsletterObjectives: 'Deliver financial market analysis, industry trends, and expert insights. [Add your organization\'s specific financial expertise and goals]',
    primaryCTA: 'Schedule a financial consultation or learn about our services. [Modify based on your specific financial offerings]'
  },
  marketing: {
    industry: "Marketing & Advertising",
    icon: "📈",
    targetAudience: "Marketing managers, advertising professionals, brand strategists",
    audienceDescription: "Marketing professionals seeking to improve campaign performance and ROI. They focus on audience engagement, conversion optimization, and brand building. Key challenges include measuring ROI, adapting to digital trends, and standing out in competitive markets.",
    newsletterObjectives: "Share marketing trends, provide campaign strategies, discuss digital innovation, and showcase successful marketing campaigns.",
    primaryCTA: "Get Marketing Analysis",
  }
};

export const getIndustryNames = () => {
  return Object.keys(industryTemplates).map(key => ({
    value: key,
    label: industryTemplates[key].industry,
    icon: industryTemplates[key].icon
  }));
};

export { industryTemplates };
