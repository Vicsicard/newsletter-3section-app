interface IndustryTemplate {
  industry: string;
  icon: string;
  targetAudience: string;
  audienceDescription: string;
  newsletterObjectives: string;
  primaryCTA: string;
}

export const industryTemplates: { [key: string]: IndustryTemplate } = {
  technology: {
    industry: "Technology & Software",
    icon: "💻",
    targetAudience: "Tech-savvy professionals, IT decision-makers, developers",
    audienceDescription: "Tech professionals seeking innovative solutions to streamline their operations. They value efficiency, scalability, and staying ahead of technology trends. Pain points include legacy system integration, security concerns, and keeping pace with rapid technological changes.",
    newsletterObjectives: "Share industry insights, highlight product updates, provide technical tips and best practices, showcase customer success stories in the tech space.",
    primaryCTA: "Schedule a Demo",
  },
  healthcare: {
    industry: "Healthcare & Medical",
    icon: "🏥",
    targetAudience: "Healthcare professionals, medical practitioners, hospital administrators",
    audienceDescription: "Healthcare professionals focused on improving patient care and operational efficiency. They prioritize patient outcomes, regulatory compliance, and evidence-based solutions. Key challenges include managing patient data, maintaining compliance, and optimizing healthcare delivery.",
    newsletterObjectives: "Share medical research updates, discuss healthcare innovations, provide compliance guidance, and highlight success stories in patient care improvement.",
    primaryCTA: "Book a Consultation",
  },
  retail: {
    industry: "Retail & E-commerce",
    icon: "🛍️",
    targetAudience: "Retail business owners, e-commerce managers, retail chain operators",
    audienceDescription: "Retail professionals looking to enhance customer experience and increase sales. They focus on inventory management, customer engagement, and competitive pricing. Challenges include inventory optimization, omnichannel presence, and customer retention.",
    newsletterObjectives: "Share retail trends, provide marketing strategies, discuss customer engagement tactics, and showcase successful retail transformations.",
    primaryCTA: "Start Free Trial",
  },
  finance: {
    industry: "Finance & Banking",
    icon: "💰",
    targetAudience: "Financial advisors, banking professionals, investment managers",
    audienceDescription: "Finance professionals seeking to optimize operations and enhance client services. They prioritize security, compliance, and client satisfaction. Main concerns include risk management, regulatory compliance, and digital transformation.",
    newsletterObjectives: "Share financial market insights, discuss regulatory updates, provide investment strategies, and highlight fintech innovations.",
    primaryCTA: "Request Portfolio Review",
  },
  education: {
    industry: "Education & E-learning",
    icon: "📚",
    targetAudience: "Educators, school administrators, e-learning professionals",
    audienceDescription: "Education professionals focused on improving learning outcomes and student engagement. They value innovative teaching methods and educational technology. Challenges include student engagement, remote learning effectiveness, and resource management.",
    newsletterObjectives: "Share educational best practices, discuss learning technologies, provide teaching strategies, and showcase successful educational programs.",
    primaryCTA: "Try Demo Class",
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
