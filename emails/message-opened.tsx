import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text
} from '@react-email/components'
import * as React from 'react'

interface MessageOpenedEmailProps {
  openingDate?: Date
  device?: string
  location?: string
  ipAddress?: string
}

export const MessageOpenedEmail = ({
  openingDate,
  device,
  location,
  ipAddress
}: MessageOpenedEmailProps) => {
  const formattedDate = new Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(openingDate)

  return (
    <Html>
      <Head />
      <Preview>Secureshare: Message Opened</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Row style={{ ...boxInfos, paddingBottom: '0' }}>
              <Column>
                <Heading
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'left'
                  }}
                >
                  Hi,
                </Heading>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'left'
                  }}
                >
                  Your message was successfully opened.
                </Heading>

                <Text style={paragraph}>
                  <b>Time: </b>
                  {formattedDate}
                </Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  <b>Device: </b>
                  {device}
                </Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  <b>Location: </b>
                  {location}
                </Text>
                <Text
                  style={{
                    color: 'rgb(0,0,0, 0.5)',
                    fontSize: 14,
                    marginTop: -5
                  }}
                >
                  *Approximate geographic location based on IP address:
                  <span style={{ marginLeft: '2px' }}>{ipAddress}</span>
                </Text>

                <Text style={paragraph}>
                  {`If this was you, there's nothing else you need to do.`}
                </Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  {`If this wasn't you or if you have additional questions, please
                  see our support page.`}
                </Text>
              </Column>
            </Row>
            <Row style={{ ...boxInfos, paddingTop: '0' }}>
              <Column style={containerButton} colSpan={2}>
                <Button style={button}>Learn More</Button>
              </Column>
            </Row>
          </Section>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'rgb(0,0,0, 0.7)'
            }}
          >
            © 2023 | Secure Share | www.secureshare.sh
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default MessageOpenedEmail

const main = {
  backgroundColor: '#fff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
}

const paragraph = {
  fontSize: 16
}

const containerButton = {
  display: 'flex',
  justifyContent: 'center',
  width: '100%'
}

const button = {
  backgroundColor: '#6D27D9',
  paddingLeft: '30px',
  paddingRight: '30px',
  paddingTop: '12px',
  paddingBottom: '12px',
  borderRadius: 3,
  color: '#FFF',
  border: '1px solid rgb(0,0,0, 0.1)',
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 500
}

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden'
}

const boxInfos = {
  padding: '20px 40px'
}
