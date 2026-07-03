import GenericChapterDetails from '../../../../components/Academic/GenericChapterDetails';
import chaptersData from '../../../../components/Academic/HSC/Chemistry/Chemistry_data/chapters.json';

export default function ChapterDetails() {
  return (
    <GenericChapterDetails
      subjectId="hsc-chemistry-1"
      chaptersData={chaptersData}
      backLink="/academic/hsc/chemistry"
      subjectLabel="রসায়ন"
    />
  );
}