import LinearRegressionMarkdownView from '../pages/Blog/posts/post_03_LinearRegression/LinearRegressionMarkdownView';
import LogisticRegressionMarkdownView from '../pages/Blog/posts/post_04_LogisticRegression/LogisticRegressionMarkdownView';


export const allBlogs = [
  {
    id: "post_04",
    slug: "logistic-regression-classification-master",
    title: "লজিস্টিক রিগ্রেশন (Logistic Regression): দ্য ক্লাসিফিকেশন মাস্টার",
    excerpt: "লিনিয়ার রিগ্রেশন দিয়ে সংখ্যা প্রেডিক্ট করা যায়, কিন্তু 'হ্যাঁ অথবা না' তে সিদ্ধান্ত নিতে হলে কী করবেন? লজিস্টিক রিগ্রেশনের ম্যাজিক জানুন।",
    category: "Algorithm",
    date: "১ জুন, ২০২৬",
    readTime: "১২ মিনিট",
    author: "রামীম আহমেদ",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1200",
    tags: ["Machine Learning", "Algorithm", "Classification", "Python"],
    Component: LogisticRegressionMarkdownView
  },
  {
    id: "post_03",
    slug: "linear-regression-ultimate-guide",
    title: "লিনিয়ার রিগ্রেশন (Linear Regression): দ্য আল্টিমেট গাইড (গল্পে ও গাণিতিক বিশ্লেষণে)",
    excerpt: "মেশিন লার্নিংয়ের সবচেয়ে মৌলিক অ্যালগরিদম 'লিনিয়ার রিগ্রেশন' কীভাবে কাজ করে? পাবজি খেলার উদাহরণ থেকে শুরু করে পাইথনে কোড লেখা পর্যন্ত সবকিছু শিখুন সহজ বাংলায়।",
    category: "Algorithm",
    date: "৩০ মে, ২০২৬",
    readTime: "১৫ মিনিট",
    author: "রামীম আহমেদ",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    tags: ["Machine Learning", "Algorithm", "Python"],
    Component: LinearRegressionMarkdownView
  }
];
