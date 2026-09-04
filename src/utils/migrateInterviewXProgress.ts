export const migrateInterviewXProgress = () => {
  const subjects = ['dsa', 'os', 'cn', 'lld', 'dbms'];

  subjects.forEach(subject => {
    const finalKey = `interviewx_${subject}_completed`;
    const dsaxKey = `dsax_${subject}_completed`;
    const tufKey = `tuf_plus_${subject}_completed`;

    const finalData = localStorage.getItem(finalKey);
    const dsaxData = localStorage.getItem(dsaxKey);
    const tufData = localStorage.getItem(tufKey);

    // If the final key exists, we don't overwrite it. 
    // We just clean up old keys if they exist safely.
    if (finalData !== null) {
      if (dsaxData !== null) localStorage.removeItem(dsaxKey);
      if (tufData !== null) localStorage.removeItem(tufKey);
      
      // PRECISE PURGE LOGIC FOR CORRUPTED DBMS PROGRESS
      // Some users had `tuf_plus_dbms_completed` accidentally filled with 94 DSA numeric IDs.
      // This caused DBMS to automatically mark 100% completed.
      if (subject === 'dbms') {
        try {
          const parsedDbms = JSON.parse(finalData);
          if (Array.isArray(parsedDbms) && parsedDbms.length === 94) {
            // Check if it's perfectly sequential (either [1..94] or ["v-1".."v-94"])
            const isCorrupted = parsedDbms.every((id, idx) => {
              const expectedNum = idx + 1;
              return id === expectedNum || id === `v-${expectedNum}`;
            });
            if (isCorrupted) {
              console.warn("Purging corrupted DBMS progress data (accidental 100% completion bug).");
              localStorage.removeItem(finalKey);
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      return; // done with this subject
    }

    // Determine the source to migrate from
    let sourceData: string | null = null;
    let sourceKey: string | null = null;

    if (dsaxData !== null) {
      sourceData = dsaxData;
      sourceKey = dsaxKey;
    } else if (tufData !== null) {
      sourceData = tufData;
      sourceKey = tufKey;
    }

    if (sourceData !== null && sourceKey !== null) {
      try {
        // Validate JSON
        const parsed = JSON.parse(sourceData);
        if (Array.isArray(parsed)) {
          // Write to new key
          localStorage.setItem(finalKey, JSON.stringify(parsed));
          
          // Verify the new key was written successfully
          const migratedValue = localStorage.getItem(finalKey);
          if (migratedValue === sourceData) {
            // ONLY THEN remove the old keys
            localStorage.removeItem(sourceKey);
            // Just to be exhaustive, if tufKey exists and we migrated from dsaxKey, we can clean tufKey
            if (sourceKey === dsaxKey && tufData !== null) {
               localStorage.removeItem(tufKey);
            }
          }
        }
      } catch (e) {
        console.error(`Failed to parse old data for ${subject} during InterviewX migration.`);
      }
    }
  });
};
