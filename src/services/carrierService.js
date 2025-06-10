import supabase from './supabase';

const carrierService = {
  async getCarriersByPage(page = 1, limit = 12) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('carriers')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar fornecedores:', error);
      throw error;
    }

    return {
      carriers: data,
      total: count,
      totalPages: Math.ceil(count / limit)
    };
  },

  async getCarrierById(id) {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar fornecedor:', error);
      throw error;
    }

    return data;
  },

  async getAllCarriers() {
    const { data, error } = await supabase
      .from('carriers')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar todas as fornecedores:', error);
      throw error;
    }

    return data;
  },


  async createCarrier(carrie) {
    const { data, error } = await supabase
      .from('carriers')
      .insert([carrie])
      .select();

    if (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw error;
    }

    return data[0];
  },

  async updateCarrier(id, carrie) {
    const { data, error } = await supabase
      .from('carriers')
      .update(carrie)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw error;
    }

    return data[0];
  },

  async deleteCarrier(id) {
    const { error } = await supabase
      .from('carriers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar fornecedor:', error);
      throw error;
    }

    return true;
  }
};

export default carrierService;
