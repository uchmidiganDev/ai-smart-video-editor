import { PIPELINE_STAGES } from "@/lib/pipelineStages";
import { StepRow, type StepStatus } from "@/components/pipeline/StepRow";

export function ProcessingStepper({ overallProgress }: { overallProgress: number }) {
  const totalStages = PIPELINE_STAGES.length;
  const stagePosition = (overallProgress / 100) * totalStages;

  return (
    <div>
      {PIPELINE_STAGES.map((stage, i) => {
        let status: StepStatus = "pending";
        let progress = 0;
        if (stagePosition >= i + 1) {
          status = "done";
          progress = 100;
        } else if (stagePosition > i) {
          status = "active";
          progress = (stagePosition - i) * 100;
        }
        return <StepRow key={stage.id} stage={stage} status={status} progress={progress} index={i} />;
      })}
    </div>
  );
}
