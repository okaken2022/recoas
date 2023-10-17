import React from 'react';
import { Box, Flex, ListItem, Badge, Spacer, UnorderedList } from '@chakra-ui/react';
import { SingleRecord } from '@/types/record';

interface RecordHeaderProps {
  singleRecordData: {
    docId: string;
    data: SingleRecord;
  }[];
  goToRecordEditPage: (value: string) => void;
}

const RecordList: React.FC<RecordHeaderProps> = ({ singleRecordData, goToRecordEditPage }) => {
  return (
    <>
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
        {singleRecordData.map((record, index) => {
          const { docId, data } = record;
          const { situation, support, good, notice } = data;
          //改行を反映させる
          const newLineSituation = situation.replaceAll('\\n', '\n');
          const newLineSupport = support.replaceAll('\\n', '\n');

          const backgroundColor = index % 2 === 0 ? 'gray.100' : 'white'; // 背景色を交互に設定

          return (
            <ListItem
              key={docId}
              className='record'
              backgroundColor={backgroundColor}
              onClick={() => goToRecordEditPage(docId)}
              whiteSpace='pre-line'
            >
              <Flex pt='2' pr='2'>
                <Badge ml='2' variant='outline'>
                  {record.data.editor}
                </Badge>
                <Spacer />
                {good && (
                  <Badge ml='2' colorScheme='teal'>
                    Good
                  </Badge>
                )}
                {notice && (
                  <Badge ml='2' colorScheme='red'>
                    特記事項
                  </Badge>
                )}
              </Flex>
              <Flex>
                <Box p='2' w='50%' borderRight='1px'>
                  {newLineSituation}
                </Box>
                <Box p='2' w='50%'>
                  {newLineSupport}
                </Box>
              </Flex>
            </ListItem>
          );
        })}
      </UnorderedList>
    </>
  );
};

export default RecordList;
