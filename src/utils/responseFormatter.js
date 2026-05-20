/**
 * Professional AI Response Formatter
 * Converts any AI output (JSON, objects, arrays) into clean markdown text
 * Similar to ChatGPT, Claude, and Gemini formatting
 */

export function formatAIResponse(data) {
  // If already a clean string, return it
  if (typeof data === 'string' && !isJSON(data)) {
    return data;
  }

  // Try to parse if it's a JSON string
  let parsed = data;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      // Not JSON, return as is
      return data;
    }
  }

  // If not an object, convert to string
  if (typeof parsed !== 'object' || parsed === null) {
    return String(parsed);
  }

  // Format the object into markdown
  return formatObject(parsed);
}

function isJSON(str) {
  if (typeof str !== 'string') return false;
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
}

function formatObject(obj) {
  let output = '';

  // Extract main content fields first
  const mainFields = ['message', 'response', 'text', 'answer', 'content', 'explanation', 'description'];
  for (const field of mainFields) {
    if (obj[field] && typeof obj[field] === 'string') {
      output += obj[field] + '\n\n';
      delete obj[field];
    }
  }

  // Handle title
  if (obj.title) {
    output += `# ${obj.title}\n\n`;
    delete obj.title;
  }

  // Handle study plan structure
  if (obj.studyPlan) {
    output += formatStudyPlan(obj.studyPlan);
    return output.trim();
  }

  // Handle week-based structure (week1, week2, etc.)
  const weekKeys = Object.keys(obj).filter(k => /^week\d+$/i.test(k)).sort();
  if (weekKeys.length > 0) {
    output += '# Study Plan\n\n';
    weekKeys.forEach(weekKey => {
      const week = obj[weekKey];
      const weekNum = weekKey.replace(/\D/g, '');
      output += `## Week ${weekNum}\n\n`;
      
      if (week.goal) output += `**Goal:** ${week.goal}\n\n`;
      if (week.description) output += `${week.description}\n\n`;
      
      if (week.days && typeof week.days === 'object') {
        Object.keys(week.days).sort().forEach(dayKey => {
          const day = week.days[dayKey];
          const dayLabel = dayKey.replace(/day/gi, 'Day ').replace(/-/g, ' to ');
          output += `### ${dayLabel}\n\n`;
          
          if (day.focus) output += `**Focus:** ${day.focus}\n\n`;
          
          if (day.tasks && Array.isArray(day.tasks)) {
            day.tasks.forEach(task => {
              if (typeof task === 'string') {
                output += `• ${task}\n`;
              } else if (task.task) {
                output += `• ${task.task}`;
                if (task.subject) {
                  const subjects = Array.isArray(task.subject) ? task.subject.join(', ') : task.subject;
                  output += ` *(${subjects})*`;
                }
                if (task.duration) output += ` — ${task.duration}`;
                output += '\n';
              }
            });
          }
          output += '\n';
        });
      }
    });
    return output.trim();
  }

  // Handle definition/explanation structure
  if (obj.definition) {
    output += `${obj.definition}\n\n`;
    delete obj.definition;
  }

  // Handle key sections
  const sectionFields = ['key_points', 'key_components', 'features', 'benefits', 'advantages', 'how_it_works'];
  sectionFields.forEach(field => {
    if (obj[field]) {
      const title = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      output += `### ${title}\n\n`;
      
      if (Array.isArray(obj[field])) {
        obj[field].forEach(item => {
          if (typeof item === 'string') {
            output += `• ${item}\n`;
          } else if (typeof item === 'object' && item.title && item.description) {
            output += `• **${item.title}** → ${item.description}\n`;
          } else if (typeof item === 'object') {
            output += `• ${JSON.stringify(item).replace(/[{}"]/g, '')}\n`;
          }
        });
      } else if (typeof obj[field] === 'object') {
        Object.keys(obj[field]).forEach(key => {
          output += `• **${key.replace(/_/g, ' ')}:** ${obj[field][key]}\n`;
        });
      }
      output += '\n';
      delete obj[field];
    }
  });

  // Handle steps (numbered list)
  if (obj.steps && Array.isArray(obj.steps)) {
    output += '### Steps\n\n';
    obj.steps.forEach((step, i) => {
      if (typeof step === 'string') {
        output += `${i + 1}. ${step}\n`;
      } else if (typeof step === 'object' && step.text) {
        output += `${i + 1}. ${step.text}\n`;
      } else if (typeof step === 'object') {
        output += `${i + 1}. ${JSON.stringify(step).replace(/[{}"]/g, '')}\n`;
      }
    });
    output += '\n';
    delete obj.steps;
  }

  // Handle tips, recommendations, suggestions
  const listFields = ['tips', 'recommendations', 'suggestions', 'points', 'items', 'tasks', 'notes'];
  listFields.forEach(field => {
    if (obj[field] && Array.isArray(obj[field])) {
      const title = field.charAt(0).toUpperCase() + field.slice(1);
      output += `### ${title}\n\n`;
      obj[field].forEach((item, i) => {
        if (typeof item === 'string') {
          output += `${i + 1}. ${item}\n`;
        } else if (typeof item === 'object' && item.text) {
          output += `${i + 1}. ${item.text}\n`;
        } else if (typeof item === 'object') {
          output += `${i + 1}. ${JSON.stringify(item).replace(/[{}"]/g, '')}\n`;
        }
      });
      output += '\n';
      delete obj[field];
    }
  });

  // Handle remaining nested objects
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      output += `### ${title}\n\n`;
      Object.keys(value).forEach(subKey => {
        const subValue = value[subKey];
        const label = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        output += `• **${label}:** ${subValue}\n`;
      });
      output += '\n';
    } else if (Array.isArray(value)) {
      const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      output += `### ${title}\n\n`;
      value.forEach((item, i) => {
        if (typeof item === 'string') {
          output += `${i + 1}. ${item}\n`;
        } else if (typeof item === 'object' && item.text) {
          output += `${i + 1}. ${item.text}\n`;
        } else if (typeof item === 'object') {
          output += `${i + 1}. ${JSON.stringify(item).replace(/[{}"]/g, '')}\n`;
        }
      });
      output += '\n';
    } else if (typeof value === 'string' || typeof value === 'number') {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      output += `**${label}:** ${value}\n\n`;
    }
  });

  return output.trim() || 'I apologize, but I couldn\'t generate a proper response. Could you please rephrase your question?';
}

function formatStudyPlan(plan) {
  let output = '';
  
  if (plan.title) output += `# ${plan.title}\n\n`;
  if (plan.description) output += `${plan.description}\n\n`;
  if (plan.startDate && plan.endDate) output += `**Duration:** ${plan.startDate} to ${plan.endDate}\n`;
  if (plan.hoursPerDay) output += `**Study Time:** ${plan.hoursPerDay} hours per day\n\n`;
  
  if (plan.subjects && Array.isArray(plan.subjects)) {
    output += '## Subjects Breakdown\n\n';
    plan.subjects.forEach((subject, idx) => {
      output += `### ${idx + 1}. ${subject.name}`;
      if (subject.weightage) output += ` (${subject.weightage}% weightage)`;
      output += '\n\n';
      
      if (subject.topics && Array.isArray(subject.topics)) {
        subject.topics.forEach(topic => {
          output += `**${topic.name}**`;
          if (topic.hoursToStudy) output += ` — ${topic.hoursToStudy} hours`;
          output += '\n';
          
          if (topic.description) output += `${topic.description}\n`;
          
          if (topic.studyPlan && Array.isArray(topic.studyPlan)) {
            topic.studyPlan.forEach(day => {
              output += `  • Day ${day.day}: ${day.hours} hours`;
              if (day.focus) output += ` — ${day.focus}`;
              output += '\n';
            });
          }
          output += '\n';
        });
      }
    });
  }
  
  return output;
}
