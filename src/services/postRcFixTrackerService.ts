import {
  loadPilotFeedbackState,
  savePilotFeedbackState,
  PilotFeedbackState,
  PostRcFixItem,
  PilotFeedbackSeverity
} from './pilotFeedbackService';

export function loadPostRcFixes(): PostRcFixItem[] {
  const state = loadPilotFeedbackState();
  return state.fixes;
}

export function savePostRcFixes(fixes: PostRcFixItem[]): void {
  const state = loadPilotFeedbackState();
  state.fixes = fixes;
  savePilotFeedbackState(state);
  // Keep the dual key updated as requested in guidelines
  localStorage.setItem('orbi_clima_post_rc_fix_tracker_v1', JSON.stringify(fixes));
}

export function addPostRcFix(fix: Omit<PostRcFixItem, 'id' | 'createdAt' | 'updatedAt'>): PilotFeedbackState {
  const state = loadPilotFeedbackState();
  const newFix: PostRcFixItem = {
    ...fix,
    id: `fix_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  state.fixes = [...state.fixes, newFix];
  
  // If source feedback IDs are provided, link them
  if (newFix.sourceFeedbackIds && newFix.sourceFeedbackIds.length > 0) {
    state.feedback = state.feedback.map(fb => {
      if (newFix.sourceFeedbackIds.includes(fb.id)) {
        return {
          ...fb,
          linkedFixId: newFix.id,
          status: 'needs_fix',
          updatedAt: new Date().toISOString()
        };
      }
      return fb;
    });
  }

  savePilotFeedbackState(state);
  localStorage.setItem('orbi_clima_post_rc_fix_tracker_v1', JSON.stringify(state.fixes));
  return state;
}

export function updatePostRcFix(id: string, partial: Partial<PostRcFixItem>): PilotFeedbackState {
  const state = loadPilotFeedbackState();
  state.fixes = state.fixes.map(fix => {
    if (fix.id === id) {
      const updatedFix = {
        ...fix,
        ...partial,
        updatedAt: new Date().toISOString()
      };
      
      // If we are changing the status to validated or closed, we can also update linked feedback status
      if (partial.status === 'validated') {
        state.feedback = state.feedback.map(fb => {
          if (updatedFix.sourceFeedbackIds.includes(fb.id) && fb.status !== 'closed' && fb.status !== 'validated') {
            return { ...fb, status: 'validated', updatedAt: new Date().toISOString() };
          }
          return fb;
        });
      } else if (partial.status === 'closed') {
        state.feedback = state.feedback.map(fb => {
          if (updatedFix.sourceFeedbackIds.includes(fb.id) && fb.status !== 'closed') {
            return { ...fb, status: 'closed', updatedAt: new Date().toISOString() };
          }
          return fb;
        });
      } else if (partial.status === 'in_progress') {
        state.feedback = state.feedback.map(fb => {
          if (updatedFix.sourceFeedbackIds.includes(fb.id) && fb.status === 'new') {
            return { ...fb, status: 'triaged', updatedAt: new Date().toISOString() };
          }
          return fb;
        });
      }

      return updatedFix;
    }
    return fix;
  });

  savePilotFeedbackState(state);
  localStorage.setItem('orbi_clima_post_rc_fix_tracker_v1', JSON.stringify(state.fixes));
  return state;
}

export function deletePostRcFix(id: string): PilotFeedbackState {
  const state = loadPilotFeedbackState();
  state.fixes = state.fixes.filter(fix => fix.id !== id);
  // Un-link from feedback items
  state.feedback = state.feedback.map(fb => {
    if (fb.linkedFixId === id) {
      return {
        ...fb,
        linkedFixId: undefined,
        status: 'triaged',
        updatedAt: new Date().toISOString()
      };
    }
    return fb;
  });
  savePilotFeedbackState(state);
  localStorage.setItem('orbi_clima_post_rc_fix_tracker_v1', JSON.stringify(state.fixes));
  return state;
}
