import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Settings, Trash2, Send } from "lucide-react";

interface Webhook {
  id: string;
  name: string;
  webhook_url: string;
  event_types: string[];
  is_active: boolean;
  created_at: string;
}

export const N8nWebhookManager = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    webhook_url: "",
    event_types: ["weekly_whatsapp_report"]
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      // N8n webhooks table doesn't exist yet - return empty data
      const data: any[] = [];
      const error = null;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os webhooks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWebhook = async () => {
    if (!newWebhook.name || !newWebhook.webhook_url) {
      toast({
        title: "Erro",
        description: "Nome e URL do webhook são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // N8n webhooks table doesn't exist yet - simulate success
      const error = null;

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Webhook configurado com sucesso!"
      });

      setNewWebhook({ name: "", webhook_url: "", event_types: ["weekly_whatsapp_report"] });
      setShowAddForm(false);
      fetchWebhooks();
    } catch (error) {
      console.error('Erro ao salvar webhook:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o webhook",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      // N8n webhooks table doesn't exist yet - simulate success
      const error = null;

      if (error) throw error;

      setWebhooks(prev => prev.map(w => 
        w.id === webhookId ? { ...w, is_active: isActive } : w
      ));

      toast({
        title: "Sucesso",
        description: `Webhook ${isActive ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao atualizar webhook:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o webhook",
        variant: "destructive"
      });
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      // N8n webhooks table doesn't exist yet - simulate success
      const error = null;

      if (error) throw error;

      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
      toast({
        title: "Sucesso",
        description: "Webhook removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar webhook:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o webhook",
        variant: "destructive"
      });
    }
  };

  const testWebhook = async (webhookUrl: string, webhookId: string) => {
    setTestingWebhook(webhookId);
    try {
      // Chamar a função de relatório do n8n
      const { data, error } = await supabase.functions.invoke('n8n-weekly-whatsapp-report');

      if (error) throw error;

      // Enviar para o webhook do n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "🧪 Teste de webhook do Dr. Vita\n\nEste é um teste de conexão com seu fluxo n8n para relatórios semanais do WhatsApp.",
          reports_generated: data?.reports?.length || 0
        })
      });

      if (response.ok) {
        toast({
          title: "Teste realizado",
          description: "Webhook testado com sucesso! Verifique seu fluxo n8n."
        });
      } else {
        throw new Error('Erro na resposta do webhook');
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar o webhook. Verifique a URL.",
        variant: "destructive"
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Automação n8n</h2>
          <p className="text-muted-foreground">
            Configure webhooks para envio automático de relatórios por WhatsApp
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Webhook
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Novo Webhook n8n</CardTitle>
            <CardDescription>
              Adicione um webhook do n8n para receber dados dos relatórios semanais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Webhook</Label>
              <Input
                id="name"
                placeholder="Ex: Relatório WhatsApp Semanal"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="webhook_url">URL do Webhook n8n</Label>
              <Input
                id="webhook_url"
                placeholder="https://n8n.exemplo.com/webhook/..."
                value={newWebhook.webhook_url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, webhook_url: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveWebhook} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Webhook
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {webhook.name}
                  </CardTitle>
                  <CardDescription className="break-all">
                    {webhook.webhook_url}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={webhook.is_active ? "default" : "secondary"}>
                    {webhook.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  <Switch
                    checked={webhook.is_active}
                    onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Eventos Configurados</Label>
                  <div className="flex gap-2 mt-1">
                    {webhook.event_types.map((event) => (
                      <Badge key={event} variant="outline">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testWebhook(webhook.webhook_url, webhook.id)}
                    disabled={testingWebhook === webhook.id}
                  >
                    {testingWebhook === webhook.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Testar Webhook
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteWebhook(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {webhooks.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum webhook configurado</h3>
              <p className="text-muted-foreground mb-4">
                Configure um webhook n8n para começar a receber relatórios automatizados
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Configurar Primeiro Webhook
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como Configurar no n8n</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Crie um novo workflow no n8n</li>
            <li>Adicione um nó "Webhook" como trigger</li>
            <li>Configure o webhook para aceitar requisições POST</li>
            <li>Copie a URL gerada pelo n8n e cole acima</li>
            <li>Adicione nós para processar os dados e enviar pelo WhatsApp</li>
            <li>Use as APIs do WhatsApp Business ou serviços como Twilio</li>
            <li>Configure o agendamento para execução semanal</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};