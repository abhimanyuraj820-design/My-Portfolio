import API_BASE_URL from '../config';

export const getSEORecords = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/seo`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch SEO records');
    return await response.json();
  } catch (error) {
    console.error('Error fetching SEO records:', error);
    throw error;
  }
};

export const saveSEORecord = async (data) => {
  try {
    const isNew = data.id === 'new';
    const url = isNew ? `${API_BASE_URL}/api/seo` : `${API_BASE_URL}/api/seo/${data.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = { ...data };
    if (isNew) delete payload.id;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save SEO record');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving SEO record:', error);
    throw error;
  }
};
