export function segmentHours(segments){return segments.reduce((n,s)=>n+Math.max(0,s.end-s.start),0)/3600000;}
export function recordsInRange(items,range=null){
  const output=[];
  for(const item of items){
    if(!Array.isArray(item.timeSegments)||item._ranges){if(!range||(item.workDate>=range.start&&item.workDate<=range.end))output.push(item);continue;}
    const days=new Map();
    for(const segment of item.timeSegments){
      if(!Number.isFinite(segment.start)||!Number.isFinite(segment.end)||segment.end<segment.start)throw Error('工作分段时间无效');
      for(let cursor=segment.start;cursor<segment.end;){
        const d=new Date(cursor),midnight=new Date(d.getFullYear(),d.getMonth(),d.getDate()),next=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime();
        const end=Math.min(next,segment.end),key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
        if(!range||(key>=range.start&&key<=range.end)){if(!days.has(key))days.set(key,[]);days.get(key).push({start:(cursor-midnight.getTime())/60000,end:(end-midnight.getTime())/60000,project:item.project||'未归类项目'});}
        cursor=end;
      }
    }
    for(const [workDate,ranges] of days)output.push({...item,workDate,_ranges:ranges,hours:ranges.reduce((n,r)=>n+r.end-r.start,0)/60});
  }
  return output;
}
