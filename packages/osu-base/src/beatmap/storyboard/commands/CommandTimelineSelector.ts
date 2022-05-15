import { CommandTimeline } from "./CommandTimeline";
import { CommandTimelineGroup } from "./CommandTimelineGroup";

export type CommandTimelineSelector<T> = (
    timelineGroup: CommandTimelineGroup
) => CommandTimeline<T>;
