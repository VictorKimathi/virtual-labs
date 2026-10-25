import { useParams } from "react-router-dom";
import { TeacherClassView } from "../components/TeacherClassView";
import { TeacherGate } from "../components/TeacherGate";

export default function TeacherClassPage() {
  const { classId = "" } = useParams();
  return (
    <TeacherGate>
      {(teacher) => (
        <TeacherClassView key={classId} classId={classId} teacher={teacher} />
      )}
    </TeacherGate>
  );
}
