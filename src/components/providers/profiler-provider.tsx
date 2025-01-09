import {
  Profiler,
  type ProfilerOnRenderCallback,
  type PropsWithChildren,
} from "react";

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  // Log performance metrics only in development
  if (import.meta.env.DEV) {
    console.log(
      `%c🔄 Component "${id}" ${phase === "mount" ? "mounted" : "re-rendered"}`,
      "color: #00c853; font-weight: bold;",
      {
        phase,
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        timing: `Started at ${startTime.toFixed(2)}ms, committed at ${commitTime.toFixed(2)}ms`,
      },
    );
  }
};

interface ProfilerProviderProps extends PropsWithChildren {
  id: string;
}

export function ProfilerProvider({ children, id }: ProfilerProviderProps) {
  // Only enable profiler in development mode
  if (!import.meta.env.DEV) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}
