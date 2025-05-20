import supabase from '@services/supabase';

const categoryService = {
  async getCategoriesByPage(page = 1, limit = 12) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase
      .from('categories')
      .select('id, name', { count: 'exact' })
      .range(from, to)
      .order('name', { ascending: true });
    if (error) throw error;
    return {
      categories: data,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  },

  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createCategory(payload) {
    const { data, error } = await supabase
      .from('categories')
      .insert([payload])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id, payload) {
    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};

export default categoryService;
