import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { 
  Upload, 
  FileText, 
  Database, 
  Plus, 
  Search,
  Download,
  Trash2,
  Edit,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  Settings,
  MoreVertical,
  Archive,
  ArchiveRestore
} from 'lucide-react';
import { Document, KnowledgeItem, LiveRoom } from '../types';
import { generateDocuments, generateKnowledgeItems, liveRooms } from '../utils/mockData';

export function KnowledgeBasePage() {
  const [documents, setDocuments] = useState(generateDocuments(25));
  const [knowledgeItems, setKnowledgeItems] = useState(generateKnowledgeItems(60));
  const [rooms, setRooms] = useState<LiveRoom[]>(liveRooms);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewKnowledgeOpen, setIsNewKnowledgeOpen] = useState(false);
  const [isNewRoomOpen, setIsNewRoomOpen] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({ question: '', answer: '', source: '', roomId: 'none' });
  const [newRoom, setNewRoom] = useState({ name: '' });
  
  // 排序后的直播间列表，活跃的在前，归档的在后
  const sortedRooms = [...rooms].sort((a, b) => {
    if (a.status === 'active' && b.status === 'archived') return -1;
    if (a.status === 'archived' && b.status === 'active') return 1;
    return 0;
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesRoom = selectedRoom === 'all' || doc.roomId === selectedRoom;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoom && matchesSearch;
  });

  const filteredKnowledge = knowledgeItems.filter(item => {
    const matchesRoom = selectedRoom === 'all' || item.roomId === selectedRoom;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoom && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processed':
        return '已挖掘';
      case 'processing':
        return '正在处理';
      case 'pending':
        return '待挖掘';
      default:
        return '未知';
    }
  };

  const getFileTypeIcon = (type: string) => {
    return <FileText className="size-4" />;
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleCreateKnowledge = () => {
    if (newKnowledge.question && newKnowledge.answer) {
      const knowledge: KnowledgeItem = {
        id: `knowledge-new-${Date.now()}`,
        question: newKnowledge.question,
        answer: newKnowledge.answer,
        source: newKnowledge.source || '手动创建',
        upvotes: 0,
        downvotes: 0,
        usageCount: 0,
        createdAt: new Date(),
        status: 'active',
        roomId: newKnowledge.roomId && newKnowledge.roomId !== 'none' ? newKnowledge.roomId : undefined
      };
      
      setKnowledgeItems(prev => [knowledge, ...prev]);
      setNewKnowledge({ question: '', answer: '', source: '', roomId: 'none' });
      setIsNewKnowledgeOpen(false);
    }
  };

  const handleVoteKnowledge = (id: string, vote: 'up' | 'down') => {
    setKnowledgeItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              upvotes: vote === 'up' ? item.upvotes + 1 : item.upvotes,
              downvotes: vote === 'down' ? item.downvotes + 1 : item.downvotes
            }
          : item
      )
    );
  };

  const handleDeleteKnowledge = (id: string) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCreateRoom = () => {
    if (newRoom.name.trim()) {
      const room: LiveRoom = {
        id: `room-new-${Date.now()}`,
        name: newRoom.name.trim(),
        onlineCount: 0,
        status: 'active'
      };
      
      setRooms(prev => [...prev, room]);
      setSelectedRoom(room.id); // 切换到新创建的场景
      setNewRoom({ name: '' });
      setIsNewRoomOpen(false);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    // 删除场景时，同时清理相关的文档和知识库条目
    setRooms(prev => prev.filter(room => room.id !== roomId));
    setDocuments(prev => prev.filter(doc => doc.roomId !== roomId));
    setKnowledgeItems(prev => prev.filter(item => item.roomId !== roomId));
    
    // 如果当前选中的是被删除的场景，则切换到"全部场景"
    if (selectedRoom === roomId) {
      setSelectedRoom('all');
    }
  };

  const handleArchiveRoom = (roomId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, status: 'archived' } : room
    ));
  };

  const handleRestoreRoom = (roomId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, status: 'active' } : room
    ));
  };

  const handleRoomSelectChange = (value: string) => {
    if (value === 'create-new') {
      setIsNewRoomOpen(true);
    } else {
      setSelectedRoom(value);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">知识库管理</h2>
            <p className="text-sm text-muted-foreground">管理文档和Q&A知识，构建智能客服知识体系</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Select value={selectedRoom} onValueChange={handleRoomSelectChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部场景</SelectItem>
                  {sortedRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center gap-2">
                        <span>{room.name}</span>
                        {room.status === 'archived' && (
                          <Badge variant="secondary" className="text-xs">
                            <Archive className="size-2 mr-1" />
                            归档
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  <Separator className="my-1" />
                  <SelectItem value="create-new">
                    <div className="flex items-center gap-2 w-full">
                      <Plus className="size-3" />
                      <span>新建场景</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* 场景管理下拉菜单 */}
              {selectedRoom !== 'all' && selectedRoom !== 'create-new' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {sortedRooms.find(room => room.id === selectedRoom)?.status === 'active' ? (
                      <>
                        <DropdownMenuItem onClick={() => handleArchiveRoom(selectedRoom)}>
                          <Archive className="size-3 mr-2" />
                          归档场景
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRoom(selectedRoom)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3 mr-2" />
                          删除场景
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => handleRestoreRoom(selectedRoom)}>
                          <ArchiveRestore className="size-3 mr-2" />
                          恢复场景
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRoom(selectedRoom)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3 mr-2" />
                          删除场景
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索文档或知识..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="size-4" />
              文档管理
              <Badge variant="secondary">{filteredDocuments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <Database className="size-4" />
              Q&A知识
              <Badge variant="secondary">{filteredKnowledge.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    文档列表
                  </CardTitle>
                  <Button className="gap-2">
                    <Upload className="size-4" />
                    上传文档
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getFileTypeIcon(doc.type)}
                            <div className="flex-1">
                              <h4 className="font-medium">{doc.name}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span>{formatFileSize(doc.size)}</span>
                                <span>上传于 {formatDate(doc.uploadDate)}</span>
                                {doc.extractedQACount > 0 && (
                                  <span>已提取 {doc.extractedQACount} 条Q&A</span>
                                )}
                              </div>
                              {doc.roomId && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">
                                    {rooms.find(r => r.id === doc.roomId)?.name}
                                  </Badge>
                                  {rooms.find(r => r.id === doc.roomId)?.status === 'archived' && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Archive className="size-2 mr-1" />
                                      归档
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={getStatusColor(doc.status)}
                            >
                              {getStatusLabel(doc.status)}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Download className="size-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Q&A知识库</CardTitle>
                  <Dialog open={isNewKnowledgeOpen} onOpenChange={setIsNewKnowledgeOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="gap-2"
                        onClick={() => {
                          // 如果已选择特定场景，自动带入场景
                          if (selectedRoom !== 'all') {
                            setNewKnowledge(prev => ({ ...prev, roomId: selectedRoom }));
                          }
                        }}
                      >
                        <Plus className="size-4" />
                        新建知识
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>创建新的Q&A知识</DialogTitle>
                        <DialogDescription>
                          创建一个新的问答知识条目，可以指定所属场景和来源信息
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">问题</label>
                          <Textarea
                            placeholder="输入问题内容..."
                            value={newKnowledge.question}
                            onChange={(e) => setNewKnowledge(prev => ({ ...prev, question: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">回答</label>
                          <Textarea
                            placeholder="输入回答内容..."
                            value={newKnowledge.answer}
                            onChange={(e) => setNewKnowledge(prev => ({ ...prev, answer: e.target.value }))}
                            className="mt-1 min-h-[120px]"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">所属场景</label>
                          <Select 
                            value={newKnowledge.roomId} 
                            onValueChange={(value) => setNewKnowledge(prev => ({ ...prev, roomId: value }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="选择场景..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">不指定场景</SelectItem>
                              {sortedRooms.filter(room => room.status === 'active').map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                  {room.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            选择此知识所属的直播场景，不选择则适用于所有场景
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">来源</label>
                          <Input
                            placeholder="输入来源信息..."
                            value={newKnowledge.source}
                            onChange={(e) => setNewKnowledge(prev => ({ ...prev, source: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsNewKnowledgeOpen(false);
                              setNewKnowledge({ question: '', answer: '', source: '', roomId: 'none' });
                            }}
                          >
                            取消
                          </Button>
                          <Button onClick={handleCreateKnowledge}>
                            创建
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredKnowledge.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                              {item.status === 'active' ? '启用' : '禁用'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              来源：{item.source}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVoteKnowledge(item.id, 'up')}
                              className="gap-1"
                            >
                              <ThumbsUp className="size-3" />
                              {item.upvotes}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVoteKnowledge(item.id, 'down')}
                              className="gap-1"
                            >
                              <ThumbsDown className="size-3" />
                              {item.downvotes}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="size-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteKnowledge(item.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">问：</span>
                            <p className="text-sm text-foreground mt-1">{item.question}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">答：</span>
                            <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" />
                              使用 {item.usageCount} 次
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                          {item.roomId && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {rooms.find(r => r.id === item.roomId)?.name}
                              </Badge>
                              {rooms.find(r => r.id === item.roomId)?.status === 'archived' && (
                                <Badge variant="secondary" className="text-xs">
                                  <Archive className="size-2 mr-1" />
                                  归档
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 新建场景对话框 */}
        <Dialog open={isNewRoomOpen} onOpenChange={setIsNewRoomOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="size-4" />
                新建场景
              </DialogTitle>
              <DialogDescription>
                创建一个新的直播场景，用于分类管理相关的知识库内容
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">场景名称</label>
                <Input
                  placeholder="输入场景名称..."
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ name: e.target.value })}
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateRoom();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  例如：淘宝直播间、抖音直播间、产品咨询等
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewRoomOpen(false);
                    setNewRoom({ name: '' });
                  }}
                >
                  取消
                </Button>
                <Button 
                  onClick={handleCreateRoom}
                  disabled={!newRoom.name.trim()}
                >
                  创建场景
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}