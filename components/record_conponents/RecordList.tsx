import type React from 'react';
import { Box, Flex, ListItem, Badge, Spacer, UnorderedList, Button, IconButton } from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons'; // Chakra UIのアイコンを利用
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragEndEvent } from '@dnd-kit/core';

import type { SingleRecord } from '@/types/record';

interface RecordHeaderProps {
  singleRecordData: {
    docId: string;
    data: SingleRecord;
  }[];
  goToRecordEditPage: (value: string) => void;
  setSingleRecordData: (data: { docId: string; data: SingleRecord }[]) => void;
  handleDragEnd: (event: DragEndEvent) => void; // DragEndのハンドラーを追加
}

const RecordList: React.FC<RecordHeaderProps> = ({
  singleRecordData,
  goToRecordEditPage,
  setSingleRecordData,
  handleDragEnd,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd} // 並べ替えの終了をハンドリング
    >
      <SortableContext
        items={singleRecordData.map((record) => record.docId)}
        strategy={verticalListSortingStrategy}
      >
        <Flex>
          {/* 記録 */}
          <Box
            bg='white'
            alignItems='center'
            textAlign='center'
            borderLeft='1px'
            borderRight='1px'
            width='50%'
          >
            ご本人の様子
          </Box>
          <Box bg='white' alignItems='center' textAlign='center' borderRight='1px' width='50%'>
            支援、考察
          </Box>
        </Flex>
        <UnorderedList
          listStyleType='none'
          ml='0'
          border='1px'
          borderBottomRadius='md'
          fontSize={{ base: 'sm', md: 'md' }}
        >
          {singleRecordData.map((record, index) => (
            <SortableItem
              key={record.docId}
              record={record}
              goToRecordEditPage={goToRecordEditPage}
              index={index}
            />
          ))}
        </UnorderedList>
      </SortableContext>
    </DndContext>
  );
};

const SortableItem: React.FC<{
  record: {
    docId: string;
    data: SingleRecord;
  };
  goToRecordEditPage: (value: string) => void;
  index: number;
}> = ({ record, goToRecordEditPage, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: record.docId,
  });
  const { situation, support, good, notice } = record.data;
  const backgroundColor = index % 2 === 0 ? 'gray.100' : 'white'; // 背景色を交互に設定

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='record'
      backgroundColor={backgroundColor}
      whiteSpace='pre-line'
    >
      <Flex pt='2' pr='2'>
        <Badge ml='2' variant='outline' style={{height: 'fit-content'}}>
          {record.data.editor}
        </Badge>
        <Spacer />
        {good && (
          <Badge ml='2' colorScheme='teal' style={{height: 'fit-content'}}>
            Good
          </Badge>
        )}
        {notice && (
          <Badge ml='2' colorScheme='red' style={{height: 'fit-content'}}>
            特記事項
          </Badge>
        )}
        <Spacer />
        <IconButton
          aria-label="Edit record"
          icon={<EditIcon />}
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation(); // バブルアップを防止してドラッグ操作を妨げないようにする
            goToRecordEditPage(record.docId);
          }}
        />
      </Flex>
      <Flex>
        <Box p='2' w='50%' borderRight='1px'>
          {situation}
        </Box>
        <Box p='2' w='50%'>
          {support}
        </Box>
      </Flex>
    </ListItem>
  );
};

export default RecordList;
