import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit, Trash2, Phone, Mail, 
  MoreVertical, X, Check, UserPlus, Tag
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { leadsAPI } from '../api/leads';
import toast from 'react-hot-toast';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [tags, setTags] = useState([]);

  // Form state
  const [form, setForm] = useState({
    name: '', email: '', phone: '', source: 'website',
    status: 'new', priority: 'medium', company: '', notes: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchTags();
  }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = [statusFilter];
      if (search) filters.search = search;
      
      const data = await leadsAPI.getLeads(filters);
      setLeads(data.leads || []);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await leadsAPI.getTags();
      setTags(data || []);
    } catch (error) {
      console.error('Failed to load tags');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await leadsAPI.updateLead(editingLead.id, form);
        toast.success('Lead updated!');
      } else {
        await leadsAPI.createLead(form);
        toast.success('Lead created!');
      }
      setShowAddModal(false);
      setEditingLead(null);
      resetForm();
      fetchLeads();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await leadsAPI.deleteLead(id);
        toast.success('Lead deleted');
        fetchLeads();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await leadsAPI.updateStatus(id, newStatus);
      toast.success('Status updated');
      fetchLeads();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const resetForm = () => {
    setForm({
      name: '', email: '', phone: '', source: 'website',
      status: 'new', priority: 'medium', company: '', notes: ''
    });
  };

  const openEdit = (lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name, email: lead.email || '', phone: lead.phone || '',
      source: lead.source || 'website', status: lead.status,
      priority: lead.priority || 'medium', company: lead.company || '',
      notes: lead.notes || ''
    });
    setShowAddModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      closed: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-500/20 text-gray-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">Leads</h1>
            <p className="text-gray-400 mt-1">Manage and track your leads</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setEditingLead(null);
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <Plus size={20} />
            <span>Add Lead</span>
          </motion.button>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && fetchLeads()}
              placeholder="Search leads..."
              className="w-full glass pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass px-4 py-3 text-white focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Leads Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-500/20">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Contact</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Source</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Priority</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full mx-auto"
                      />
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-400">
                      No leads found. Click "Add Lead" to create one.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-primary-500/10 hover:bg-primary-500/5 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          {lead.company && (
                            <p className="text-sm text-gray-400">{lead.company}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <Mail size={14} />
                              <span>{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <Phone size={14} />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-400">{lead.source || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="bg-transparent border border-primary-500/20 rounded-lg px-2 py-1 text-sm focus:outline-none"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {getPriorityBadge(lead.priority || 'medium')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEdit(lead)}
                            className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                          >
                            <Edit size={16} className="text-blue-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">
                  {editingLead ? 'Edit Lead' : 'Add New Lead'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
                    <input
                      type="text"
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: e.target.value })}
                      className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows="3"
                    className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl"
                >
                  {editingLead ? 'Update Lead' : 'Create Lead'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}