const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchFeaturedJobs() {
  const res = await fetch(`${API_URL}/jobs?featured=true`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch jobs');
  }
  
  return res.json();
}

export async function fetchJobById(id: string) {
  const res = await fetch(`${API_URL}/jobs/${id}`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch job details');
  }
  
  return res.json();
}

export async function applyForJob(jobId: string, data: any, token: string) {
  const res = await fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ jobId, ...data })
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to apply for job');
  }
  
  return res.json();
}