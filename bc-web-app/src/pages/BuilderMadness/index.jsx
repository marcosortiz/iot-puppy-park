/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/** **********************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using Cloudscape Design components. For production code, follow the
integration guidelines:

https://cloudscape.design/patterns/patterns/overview/
*********************************************************************** */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// COMPONENT IMPORTS
import {
  BreadcrumbGroup,
  Button,
  AppLayout,
  Container,
  Header,
  HelpPanel,
  Icon,
  SpaceBetween,
  ContentLayout,
  Flashbar,
  Badge,
  Box,
  ColumnLayout,
} from '@cloudscape-design/components';

import { CounterLink } from '../Dashboard/common-components';

// Amplify
import { API, graphqlOperation, Amplify, PubSub, Auth, Hub } from 'aws-amplify';

// Common
import {
  ExternalLinkItem,
  InfoLink,
  Navigation,
  TableHeader,
} from '../../common/common-components-config';
import Sidebar from '../../common/components/Sidebar';

// Page configuration components
import {
  PageHeader,
  BittleDeviceDetailsTableConfig,
  BittleCommandsTableConfig,
  BittleCommandsTableConfig2,
} from './config';

// API functions
import { getOneBittle } from '../../graphql/queries';

// Styles
import '../../common/styles/base.scss';

// Main component for page
const BuilderMadness = () => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const { DeviceId } = useParams();
  const [singleBittle, setSingleBittle] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fireEventsCounter, setFireEventsCounter] = useState(0);
  const [pipeEventsCounter, setPipeEventsCounter] = useState(0);
  const [co2EventsCounter, setCo2EventsCounter] = useState(0);
  let nextId = 0;

  function handleMessage(data) {
    console.log(data.value.event);
    if (data.value.event === 'fire') {
      setFireEventsCounter(c => c + 1);
      console.log('pipe');
    } else if (data.value.event === 'pipe') {
      setPipeEventsCounter(c => c + 1);
    } else if(data.value.event === 'co2') {
      setCo2EventsCounter(c => c + 1);
    }


    setMessages(messages =>
      [
        ...messages,
        {
          header: `Event detected at ${new Date().toLocaleString()}`,
          type: "error",
          content: (
            <>
              event: <Badge>{data.value.event || ' unknown'}</Badge> | source: <Badge>{data.value.dog || ' unknown'}</Badge> | location: <Badge>{data.value.location || 'unknown'}</Badge>
            </>
          ),
          id: nextId++
        }
      ]
    );

    setMessages(messages =>
      [
        ...messages,
        {
          header: `Requesting AGEIS assistance`,
          type: "info",
          content: (
            <>
              {/* How to handle {data.value.event} events? */}
              Offer containment and safety recommendations and assist with incident analysis for {data.value.event} events.
            </>
          ),
          id: nextId++
        }
      ]
    );
  }

  function handleResp(data) {
    setMessages(messages =>
      [
        ...messages,
        {
          header: `AGEIS response received at ${new Date().toLocaleString()}`,
          type: "info",
          content: (
            <>
              event: <Badge>{data.value.event || ' unknown'}</Badge> | source: <Badge>{data.value.dog || ' unknown'}</Badge> | location: <Badge>{data.value.location || 'unknown'}</Badge>
              <p>msg: <Badge>{data.value.msg || 'unknown'}</Badge></p>
            </>
          ),
          id: nextId++
        }
      ]
    );
  }

  function handleDog1Message(data) {
    setMessages(messages =>
      [
        ...messages,
        {
          header: `Sending message to dog1 at ${new Date().toLocaleString()}`,
          type: "success",
          content: (
            <>
              message: <Badge>{data.value.message || ' unknown'}</Badge>
            </>
          ),
          id: nextId++
        }
      ]
    );
  }

  function handleDog2Message(data) {
    setMessages(messages =>
      [
        ...messages,
        {
          header: `Sending message to dog2 at ${new Date().toLocaleString()}`,
          type: "success",
          content: (
            <>
              message: <Badge>{data.value.message || ' unknown'}</Badge>
            </>
          ),
          id: nextId++
        }
      ]
    );
  }

  function handleGlobalDogMessage(data) {
    setMessages(messages =>
      [
        ...messages,
        {
          header: `AGEIS sending the message to the edge ${new Date().toLocaleString()}`,
          type: "success",
          content: (
            <>
              message: <Badge>{data.value.message || ' unknown'}</Badge>
            </>
          ),
          id: nextId++
        }
      ]
    );
  }



  function handleCommandMessage(data) {
    setMessages(messages =>
      [
        ...messages,
        {
          header: `AGEIS sending the command to the edge ${new Date().toLocaleString()}`,
          type: "success",
          content: (
            <>
              message: <Badge>{data.value.msg || ' unknown'}</Badge>
            </>
          ),
          id: nextId++
        }
      ]
    );
  }

  // Fetch data for one bittle by 'DeviceId' specified in browser URL via useParams hook
  const fetchSingleBittle = async () => {
    try {
      const singleBittleData = await API.graphql(
        graphqlOperation(getOneBittle, { DeviceId: `${DeviceId}` })
      );
      const singleBittleDataList = singleBittleData.data.getOneBittle;
      console.log('Single Bittle List', singleBittleDataList);
      setSingleBittle(singleBittleDataList);
      // setLoading(false)
    } catch (error) {
      console.log('error on fetching single bittle', error);
    }
  };

  // Run the fetchSingleBittle() function on page load
  useEffect(() => {
    fetchSingleBittle();
  }, []);

  // Subscribe to the specific topic relating to the current bittle on the page on page load
  useEffect(() => {
    const sub = PubSub.subscribe(`bm/event`).subscribe({
      next: (data) => handleMessage(data),
      error: (error) => console.error(error),
      complete: () => console.log('Done'),
    });
    const sub2 = PubSub.subscribe(`bm/resp`).subscribe({
      next: (data) => handleResp(data),
      error: (error) => console.error(error),
      complete: () => console.log('Done'),
    });
    const sub3 = PubSub.subscribe(`Bittle1/sub`).subscribe({
      next: (data) => handleDog1Message(data),
      error: (error) => console.error(error),
      complete: () => console.log('Done'),
    });
    const sub4 = PubSub.subscribe(`Bittle2/sub`).subscribe({
      next: (data) => handleDog2Message(data),
      error: (error) => console.error(error),
      complete: () => console.log('Done'),
    });
    const sub5 = PubSub.subscribe(`bm/cmd`).subscribe({
      next: (data) => handleCommandMessage(data),
      error: (error) => console.error(error),
      complete: () => console.log('Done'),
    });
    const sub6 = PubSub.subscribe(`bittles-global/sub`).subscribe({
      next: (data) => handleGlobalDogMessage(data),
      error: (error) => console.error(error),
      complete: () => console.log('Done'),
    });
    return () => {     
      sub.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
      sub4.unsubscribe();
      sub5.unsubscribe();
      sub6.unsubscribe();
    };
  }, []);

  return (
    <AppLayout
      navigation={<Sidebar activeHref="/bittle-fleet-control" />}
      // notifications={<Notifications successNotification={false} />}
      breadcrumbs={<Breadcrumbs />} // define these values in /breadcrumbs/index.js
      content={
        <ContentLayout
          header={
            <PageHeader
              buttons={[{ text: 'My Bittles', href: '/my-bittles' }]}
              // buttons={[{ text: 'Edit' }, { text: 'Delete' }]}
              // loadHelpPanelContent={this.loadHelpPanelContent.bind(this)}
            />
          }
        >
          <SpaceBetween size="l">
            <BittleDeviceDetailsTable isInProgress />
            <Box margin="xxl" padding={{ vertical: '', horizontal: 'l' }}>
        <Container
          className="custom-dashboard-container"
          header={
            <Header
              variant="h2"
              // description="Viewing realtime data for your Bittle fleet."
            >
              Event Counters
            </Header>
          }
        >
          <ColumnLayout columns="3" variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Fire Events</Box>
              {/* <CounterLink>4</CounterLink> */}
              <CounterLink>{fireEventsCounter}</CounterLink>
            </div>
            <div>
              <Box variant="awsui-key-label">Pipe Events</Box>
              <CounterLink>{pipeEventsCounter}</CounterLink>
            </div>
            <div>
              <Box variant="awsui-key-label">CO2 Events</Box>
              <CounterLink>{co2EventsCounter}</CounterLink>
            </div>
          </ColumnLayout>
        </Container>
      </Box>








          <Container
              className="custom-dashboard-container"
              header={
                <Header
                  variant="h2"
                  description="Event details will show up here as they happen in real time."

                  actions={
                    <SpaceBetween
                      direction="horizontal"
                      size="xs"
                    >
                      <Button
                        onClick={() =>
                          setMessages(messages => [])
                        }>
                        Clear Logs
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Events Log
                </Header>
              }
            >
              <Flashbar items={messages} />
          </Container>
          </SpaceBetween>
        </ContentLayout>
      }
      contentType="table"
      tools={<ToolsContent />}
      toolsOpen={toolsOpen}
      onToolsChange={({ detail }) => setToolsOpen(detail.open)}
      stickyNotifications
    />
  );
};

export default BuilderMadness;

// Bittle Device Details Table - Configuration is in config.jsx
const BittleDeviceDetailsTable = ({
  singleBittle,
  loadHelpPanelContent,
  isInProgress,
  setToolsOpen,
}) => {
  return (
    <Container
      header={
        <Header variant="h2" description="We continuously monitor live edge events and promptly trigger AGEIS for expedited recommended actions.">
          {/* Table Title */}
          AGEIS Live Monitoring
        </Header>
      }
    >
      {/* <BittleCommandsTableConfig /> */}
    </Container>
  );
};

export const Breadcrumbs = ({ singleBittle }) => (
  <BreadcrumbGroup
    items={[
      {
        text: ' AGEIS',
        href: '/dashboard',
      },
      {
        text: 'GenEI Events',
        href: '#',
      },
    ]}
    expandAriaLabel="Show path"
    ariaLabel="Breadcrumbs"
  />
);

// Info pop out window seen when clicking 'info' or the i in a circle button on right side of page
export const ToolsContent = () => (
  <HelpPanel
    header={<h2>Fleet Control</h2>}
    footer={
      <>
        <h3>
          Learn more{' '}
          <span role="img" aria-label="Icon external Link">
            <Icon name="external" />
          </span>
        </h3>
        <ul>
          <li>
            <ExternalLinkItem
              href="https://ghgprotocol.org/Third-Party-Databases/IPCC-Emissions-Factor-Database"
              text="IPCC Emissions Factor Database"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://aws.amazon.com/energy/"
              text="AWS Energy & Utilities"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://ghgprotocol.org/"
              text="GHG Protocol Guidance"
            />
          </li>
        </ul>
      </>
    }
  >
    <p>
      This page is for managing your entire fleet at scale. Click the buttons to
      issue global commands to all connected bittles.
    </p>
  </HelpPanel>
);
