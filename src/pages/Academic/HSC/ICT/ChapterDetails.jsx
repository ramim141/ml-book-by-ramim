import GenericChapterDetails from '../../../../components/Academic/GenericChapterDetails';
import chaptersData from '../../../../components/Academic/HSC/ICT/ICT_data/chapters.json';

export default function ChapterDetails() {
  return (
    <GenericChapterDetails
      subjectId="hsc-ict"
      chaptersData={chaptersData}
      backLink="/academic/hsc/ict"
      subjectLabel="আইসিটি"
    />
  );
}