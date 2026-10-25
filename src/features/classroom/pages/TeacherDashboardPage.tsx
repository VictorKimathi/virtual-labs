import { Presentation } from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { TeacherGate } from "../components/TeacherGate";
import { TeacherHome } from "../components/TeacherHome";

export default function TeacherDashboardPage() {
  const { tr } = useLanguage();
  return (
    <TeacherGate>
      {(teacher) => (
        <div className="space-y-6">
          <PageHeader
            icon={Presentation}
            eyebrow={tr("Educator", "Mwalimu")}
            title={tr("Teacher dashboard", "Dashibodi ya mwalimu")}
            description={tr(
              "Create classes, assign lab work, review what students hand in and teach with colleagues.",
              "Unda madarasa, toa kazi za maabara, kagua kazi za wanafunzi na fundisha pamoja na wenzako.",
            )}
          />
          <TeacherHome teacher={teacher} />
        </div>
      )}
    </TeacherGate>
  );
}
