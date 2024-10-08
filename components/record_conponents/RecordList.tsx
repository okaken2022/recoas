import type React from 'react';
import { Box, Flex, ListItem, Badge, Spacer, UnorderedList, Icon } from '@chakra-ui/react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleIcon } from '@chakra-ui/icons';
import type { DragEndEvent } from '@dnd-kit/core';

import type { SingleRecord } from '@/types/record';

interface RecordHeaderProps {
  singleRecordData: {
    docId: string;
    data: SingleRecord;
  }[];
  goToRecordEditPage: (value: string) => void;
  setSingleRecordData: (data: { docId: string; data: SingleRecord }[]) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

const RecordList: React.FC<RecordHeaderProps> = ({
  singleRecordData,
  goToRecordEditPage,
  setSingleRecordData,
  handleDragEnd,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { // タッチセンサーを追加
      activationConstraint: {
        distance: 10, // 10px以上ドラッグされたときに反応
      },
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={singleRecordData.map((record) => record.docId)}
        strategy={verticalListSortingStrategy}
      >
        <Flex>
          {/* 記録 */}
          <Box
            bg="white"
            alignItems="center"
            textAlign="center"
            borderLeft="1px"
            borderRight="1px"
            width="50%"
          >
            ご本人の様子
          </Box>
          <Box bg="white" alignItems="center" textAlign="center" borderRight="1px" width="50%">
            支援、考察
          </Box>
        </Flex>
        <UnorderedList
          listStyleType="none"
          ml="0"
          border="1px"
          borderBottomRadius="md"
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
    transition: {
      duration: 250,
      easing: 'ease',
    },
    strategy: verticalListSortingStrategy,
  });

  const { situation, support, good, notice } = record.data;
  const backgroundColor = index % 2 === 0 ? 'gray.100' : 'white';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="record"
      backgroundColor={backgroundColor}
      whiteSpace="pre-line"
      onClick={() => goToRecordEditPage(record.docId)}
    >
      <Flex pt="2" pr="2">
        <Icon
          as={DragHandleIcon}
          cursor="grab"
          {...listeners}
          mr="4"
        />
        <Badge ml="2" variant="outline">
          {record.data.editor}
        </Badge>
        <Spacer />
        {good && (
          <Badge ml="2" colorScheme="teal">
            Good
          </Badge>
        )}
        {notice && (
          <Badge ml="2" colorScheme="red">
            特記事項
          </Badge>
        )}
      </Flex>
      <Flex>
        <Box p="2" w="50%" borderRight="1px">
          {situation}
        </Box>
        <Box p="2" w="50%">
          {support}
        </Box>
      </Flex>
    </ListItem>
  );
};

export default RecordList;
