import { lazy } from 'react';
import OutputLabelDetailsPage from '../components/MachineLearning/word_11_OutputLabel/OutputLabelDetailsPage';
import PatternDetailsPage from '../components/MachineLearning/word_12_Pattern/PatternDetailsPage';
import ModelDetailsPage from '../components/MachineLearning/word_13_Model/ModelDetailsPage';
import DecisionProcessDetailsPage from '../components/MachineLearning/word_14_DecisionProcess/DecisionProcessDetailsPage';
import TypesMLDetailsPage from '../components/MachineLearning/word_15_TypesML/TypesMLDetailsPage';

const AIDetailsPage = lazy(() => import('../components/MachineLearning/word_01_AI/AIDetailsPage'));
const TuringDetailsPage = lazy(() => import('../components/MachineLearning/word_02_TuringTest/TuringDetailsPage'));
const ExpertDetailsPage = lazy(() => import('../components/MachineLearning/word_03_ExpertSystem/ExpertDetailsPage'));
const MachineLearningDetailsPage = lazy(() => import('../components/MachineLearning/word_04_MachineLearning/MachineLearningDetailsPage'));
const TraditionalProgrammingDetails = lazy(() => import('../components/MachineLearning/word_05_TraditionalProgramming/TraditionalProgrammingDetails'));
const AutomationDetailsPage = lazy(() => import('../components/MachineLearning/word_06_Automation/AutomationDetailsPage'));
const AlgorithmDetailsPage = lazy(() => import('../components/MachineLearning/word_07_Algorithm/AlgorithmDetailsPage'));
const DatasetDetailsPage = lazy(() => import('../components/MachineLearning/word_08_Dataset/DatasetDetailsPage'));
const InputDataDetailsPage = lazy(() => import('../components/MachineLearning/word_09_InputData/InputDataDetailsPage'));
const FeatureDetailsPage = lazy(() => import('../components/MachineLearning/word_10_Feature/FeatureDetailsPage'));
import SupervisedDetailsPage from '../components/MachineLearning/word_16_SupervisedML/SupervisedDetailsPage';
import UnsupervisedDetailsPage from '../components/MachineLearning/word_17_Unsupervised/UnsupervisedDetailsPage';
import SemiSupervisedLearningDetailsPage from '../components/MachineLearning/word_18_SemiSupervised/SemiSupervisedLearningDetailsPage';
import ReinforcementDetailsPage from '../components/MachineLearning/word_19_ReinforcementLearning/ReinforcementDetailsPage';
import GIGODetailsPage from '../components/MachineLearning/word_20_GIGO/GIGODetailsPage';
import DataDependencyDetailsPage from '../components/MachineLearning/word_21_DataDependency/DataDependencyDetailsPage';
import BiasDetailsPage from '../components/MachineLearning/word_22_Bias/BiasDetailsPage';
import GeneralizationDetailsPage from '../components/MachineLearning/word_23_Generalization/GeneralizationDetailsPage';


export const bookStructure = [
  {
    chapterId: "chapter_01",
    chapterNo: "০১",
    chapterTitle: "এআই-এর অ আ ক খ",
    parts: [
      {
        partId: "part_01",
        partNo: "০১",
        partTitle: "এআই-এর জগত চেনা",
        words: [
          {
            id: "word_01_AI",
            path: "artificial-intelligence",
            title: "কৃত্রিম বুদ্ধিমত্তা (Artificial Intelligence)",
            Component: AIDetailsPage,
            summary: "যন্ত্রের মানুষের মতো কোনো বিষয়কে 'শনাক্ত' বা 'সিদ্ধান্ত' নেওয়ার জাদুকরী ক্ষমতা।"
          },
          {
            id: "word_02_TuringTest",
            path: "turing-test",
            title: "টুরিং টেস্ট (Turing Test)",
            Component: TuringDetailsPage,
            summary: "মেশিন কি মানুষের মতো চিন্তা করতে পারে? বুদ্ধিমত্তা যাচাইয়ের ঐতিহাসিক পরীক্ষা।"
          },
          {
            id: "word_03_ExpertSystem",
            path: "expert-system",
            title: "এক্সপার্ট সিস্টেম (Expert System)",
            Component: ExpertDetailsPage,
            summary: "রুল-ভিত্তিক এআই যা বিশেষজ্ঞের মতো পরামর্শ দেয়, কিন্তু নিজে থেকে শেখে না।"
          },
          {
            id: "word_04_MachineLearning",
            path: "machine-learning",
            title: "মেশিন লার্নিং (Machine Learning)",
            Component: MachineLearningDetailsPage,
            summary: "নিয়ম না লিখে দিয়ে, কম্পিউটারকে বিশাল ডেটা থেকে নিজে নিজে প্যাটার্ন খুঁজে লজিক তৈরি করতে দেওয়া।"
          },
          {
            id: "word_05_TraditionalProgramming",
            path: "traditional-programming",
            title: "প্রচলিত প্রোগ্রামিং (Traditional Programming)",
            Component: TraditionalProgrammingDetails,
            summary: "যেখানে মানুষ নিয়ম বানায় আর কম্পিউটার অন্ধের মতো হুকুম তামিল করে।"
          },
          {
            id: "word_06_Automation",
            path: "automation",
            title: "অটোমেশন (Automation)",
            Component: AutomationDetailsPage,
            summary: "মানুষের সরাসরি হস্তক্ষেপ ছাড়া একটি একঘেয়ে কাজ বারবার এবং নির্ভুলভাবে হওয়ার ব্যবস্থা।"
          }
        ]
      },
      {
        partId: "part_02",
        partNo: "০২",
        partTitle: "পর্ব ২: মেশিনের উপাদান",
        words: [
          {
            id: "word_07_Algorithm",
            path: "algorithm",
            title: "অ্যালগরিদম (Algorithm)",
            Component: AlgorithmDetailsPage,
            summary: "একটি সমস্যা সমাধানের জন্য নির্দিষ্ট পদক্ষেপের একটি সিরিজ।"
          },
          {
            id: "word_08_Dataset",
            path: "dataset",
            title: "ডেটাসেট (Dataset)",
            Component: DatasetDetailsPage,
            summary: "মেশিন লার্নিং অ্যালগরিদম শেখার জন্য ব্যবহৃত তথ্যের বিশাল ও গোছানো ভাণ্ডার বা জ্বালানি।"
          },
          {
            id: "word_09_InputData",
            path: "input-data",
            title: "ইনপুট ডেটা (Input Data)",
            Component: InputDataDetailsPage,
            summary: "একটি মেশিনকে কাজ করানোর জন্য নির্দিষ্ট মুহূর্তে যে কাঁচামাল বা ডিজিটাল তথ্য সরবরাহ করা হয়।"
          },
          {
            id: "word_10_Feature",
            path: "feature",
            title: "ফিচার (Feature)",
            Component: FeatureDetailsPage,
            summary: "আস্ত ইনপুট ডেটা থেকে ছেঁকে বের করা সুনির্দিষ্ট, পরিমাপযোগ্য এবং সিদ্ধান্ত নেওয়ার জন্য প্রয়োজনীয় বৈশিষ্ট্য।"
          },
          {
            id: "word_11_OutputLabel",
            path: "output-label",
            title: "আউটপুট লেবেল (Output Label)",
            Component: OutputLabelDetailsPage,
            summary: "মডেলকে প্রথমবার শেখানোর জন্য ইনপুট ডেটার গায়ে লাগিয়ে দেওয়া ট্যাগ বা সঠিক উত্তরপত্র (Answer Key)।"
          },
          {
            id: "word_12_Pattern",
            path: "pattern",
            title: "প্যাটার্ন (Pattern)",
            Component: PatternDetailsPage,
            summary: "তথ্যের বিশাল সাগরে লুকিয়ে থাকা একটি নির্দিষ্ট ছাঁচ, ছন্দ বা পুনরাবৃত্তিই হলো প্যাটার্ন।"
          },
          {
            id: "word_13_Model",
            path: "model",
            title: "মডেল (Model)",
            Component: ModelDetailsPage,
            summary: "অ্যালগরিদম (রেসিপি) যখন ডেটাসেট (উপকরণ) ব্যবহার করে জ্ঞান অর্জন করে, তখন সেই অর্জিত অভিজ্ঞতার চূড়ান্ত রূপটিই হলো মডেল।"
          },
          {
            id: "word_14_DecisionProcess",
            path: "decision-process",
            title: "ডিসিশন প্রসেস (Decision Process)",
            Component: DecisionProcessDetailsPage,
            summary: "মেশিন লার্নিং মডেল ডেটা এবং প্যাটার্নের ওপর ভিত্তি করে গাণিতিক যুক্তি প্রয়োগ করে যেভাবে সিদ্ধান্তে পৌঁছায়।"
          }
        ]
      },
      {
        partId: "part_03",
        partNo: "০৩",
        partTitle: "মেশিন লার্নিংয়ের ধরন",
        words: [
          {
            id: "word_15_TypesML",
            path: "types-ml",
            title: "মেশিন লার্নিংয়ের ধরন (Types of ML)",
            Component: TypesMLDetailsPage,
            summary: "মেশিন লার্নিংয়ের বিভিন্ন শাখা, যেমন সুপারভাইজড, আনসুপারভাইজড, রিইনফোর্সমেন্ট লার্নিং ইত্যাদি, যা মেশিনকে শেখানোর বিভিন্ন পদ্ধতি ও প্রয়োগের ধরন নির্দেশ করে।"
          },
          {
            id: "word_16_SupervisedML",
            path: "supervised-ml",
            title: "সুপারভাইজড লার্নিং (Supervised Learning)",
            Component: SupervisedDetailsPage,
            summary: "মেশিন যখন মানুষের দেওয়া 'উত্তরপত্র' বা লেবেলের সাহায্যে গাইডেন্স নিয়ে শিখতে থাকে।"
          },
          {
            id: "word_17_Unsupervised",
            path: "unsupervised-ml",
            title: "আনসুপারভাইজড লার্নিং (Unsupervised Learning)",
            Component: UnsupervisedDetailsPage,
            summary: "যেখানে কোনো শিক্ষক ছাড়াই মেশিন নিজে নিজেই কাঁচা তথ্যের গাণিতিক মিল বিশ্লেষণ করে ক্লাস্টার তৈরি করে।"
          },
          {
            id: "word_18_SemiSupervised",
            path: "semi-supervised-ml",
            title: "সেমি-সুপারভাইজড লার্নিং (Semi-supervised Learning)",
            Component: SemiSupervisedLearningDetailsPage,
            summary: "অল্প লেবেলযুক্ত এবং বিশাল লেবেলবিহীন ডেটার মিশ্রণে শেখার এক জাদুকরী ও সাশ্রয়ী পদ্ধতি।"
          },
          {
            id: "word_19_ReinforcementLearning",
            path: "reinforcement-learning",
            title: "রিইনফোর্সমেন্ট লার্নিং (Reinforcement Learning)",
            Component: ReinforcementDetailsPage,
            summary: "পরিবেশের সাথে ধাক্কা খেয়ে, ভুল থেকে শিক্ষা নেওয়া এবং সর্বোচ্চ পুরস্কার পাওয়ার মাধ্যমে নিজে নিজে শেখার পদ্ধতি।"
          }
        ]

      },
      {
        partId: "part_04",
        partNo: "০৪",
        partTitle: "পর্ব ৪: মেশিন লার্নিংয়ের দর্শন ও ঝুঁকি",
        words: [
          {
            id: "word_20_GIGO",
            path: "gigo-ml",
            title: "গার্বেজ ইন, গার্বেজ আউট (GIGO)",
            Component: GIGODetailsPage,
            summary: "মেশিনের আউটপুট সম্পূর্ণরূপে ইনপুট ডেটার ওপর নির্ভরশীল; ভুল ডেটা মানেই ভুল সিদ্ধান্ত।"
          },
          {
            id: "word_21_DataDependency",
            path: "data-dependency",
            title: "ডেটা নির্ভরতা (Data Dependency)",
            Component: DataDependencyDetailsPage,
            summary: "মডেলের কাজের ক্ষমতা এবং তার প্রেডিকশন সম্পূর্ণরূপে তার ট্রেইনিং ডেটার গুণগত মানের ওপর নির্ভরশীল।"
          },
          {
            id: "word_22_Bias",
            path: "bias",
            title: "বায়াস বা পক্ষপাতিত্ব (Bias)",
            Component: BiasDetailsPage,
            summary: "ঐতিহাসিক বা অগোছালো ডেটার কারণে এআই-এর ভুল এবং বৈষম্যমূলক সিদ্ধান্ত নেওয়ার প্রবণতা।"
          },
          {
            id: "word_23_Generalization",
            path: "generalization",
            title: "জেনারেলাইজেশন (Generalization)",
            Component: GeneralizationDetailsPage,
            summary: "মুখস্থ না করে ডেটার আসল লজিক শিখে সম্পূর্ণ নতুন পরিস্থিতিতে সঠিক সিদ্ধান্ত নেওয়ার এআই সক্ষমতা।"
          }
        ]
      }

    ]
  },

];

// হেল্পার ফাংশন
export const getAllWords = () => {
  let allWords = [];
  bookStructure.forEach(chapter => {
    chapter.parts.forEach(part => {
      part.words.forEach(word => {
        allWords.push({
          ...word,
          chapterTitle: chapter.chapterTitle,
          partTitle: part.partTitle
        });
      });
    });
  });
  return allWords;
};
