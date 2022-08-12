import { SessionInfoService } from "@core/services/session-info/session-info.service"

export function initSessionInfoFactory(
    sessionService: SessionInfoService
  ) {
    return () => {
      return sessionService.load();
    }
  }